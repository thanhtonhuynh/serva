import { buildSimplifiedRole, mergePermissions } from "@/utils/roles";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { prisma, Session } from "@serva/database";
import {
  buildUniqueCompaniesFromAccounts,
  type BasicCompany,
  type CompanyContext,
  type Employee,
  type Identity,
  type Operator,
  type SessionFlags,
  type SessionValidationResult,
} from "@serva/shared";
import { cache } from "react";
import "server-only";
import { getCompanyIdCookie, getSessionTokenCookie } from "../cookies";

export type { CompanyContext, Employee, Identity, Operator, SessionFlags, SessionValidationResult };

const SESSION_TTL = 1000 * 60 * 60 * 24 * 30; // 30 days
const SESSION_TTL_SHORT = 1000 * 60 * 60 * 24 * 15; // 15 days

// ---------------------------------------------------------------------------
// Validate a session token
// ---------------------------------------------------------------------------
export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  const result = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      identity: {
        include: {
          adminUser: { select: { id: true } },
          operators: {
            select: {
              id: true,
              company: { select: { id: true, name: true, slug: true } },
              role: { select: { name: true, permissions: { select: { code: true } } } },
              status: true,
            },
          },
          employees: {
            select: {
              id: true,
              company: { select: { id: true, name: true, slug: true } },
              status: true,
              job: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!result) {
    return { session: null, identity: null, companyCtx: null };
  }

  const { identity: dbIdentity, ...session } = result;

  if (Date.now() >= session.expiresAt.getTime()) {
    await prisma.session.delete({ where: { id: sessionId } });
    return { session: null, identity: null, companyCtx: null };
  }

  if (Date.now() >= session.expiresAt.getTime() - SESSION_TTL_SHORT) {
    session.expiresAt = new Date(Date.now() + SESSION_TTL);
    await prisma.session.update({
      where: { id: sessionId },
      data: { expiresAt: session.expiresAt },
    });
  }

  // Resolve active company from cookie
  const companyIdCookie = await getCompanyIdCookie();
  const companies = buildUniqueCompaniesFromAccounts(dbIdentity.operators, dbIdentity.employees);

  let activeCompany: BasicCompany | undefined;

  // If a company ID cookie is set, use it to set the active company
  if (companyIdCookie) {
    activeCompany = companies.find((c) => c.id === companyIdCookie);
  }

  // If no active company is set, and there is only one company, select it
  if (!activeCompany && companies.length === 1) {
    activeCompany = companies[0];
  }

  // No active company resolved
  if (!activeCompany) {
    return {
      session,
      identity: {
        ...dbIdentity,
        isPlatformAdmin: !!dbIdentity.adminUser,
      },
      companyCtx: null,
    };
  }

  // Build operator / employee for active company
  const opRecord = dbIdentity.operators.find((o) => o.company.id === activeCompany.id);
  const empRecord = dbIdentity.employees.find((e) => e.company.id === activeCompany.id);

  const operator: Operator | null = opRecord
    ? { id: opRecord.id, role: buildSimplifiedRole(opRecord.role), status: opRecord.status }
    : null;

  const employee: Employee | null = empRecord
    ? {
        id: empRecord.id,
        status: empRecord.status,
        job: empRecord.job ? { name: empRecord.job.name } : null,
      }
    : null;

  return {
    session,
    identity: {
      ...dbIdentity,
      isPlatformAdmin: !!dbIdentity.adminUser,
    },
    companyCtx: {
      companyId: activeCompany.id,
      companyName: activeCompany.name,
      operator,
      employee,
      permissions: mergePermissions(operator, employee),
    },
  };
}

/**
 * Get the current session.
 */
export const getCurrentSession = cache(async (): Promise<SessionValidationResult> => {
  const token = await getSessionTokenCookie();
  if (token === null) return { session: null, identity: null, companyCtx: null };
  return validateSessionToken(token);
});

/**
 * Generate a new session token.
 */
export function generateSessionToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return encodeBase32LowerCaseNoPadding(bytes);
}

/**
 * Create a new session record in the database.
 */
export async function createSession(
  token: string,
  identityId: string,
  flags: SessionFlags,
): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  return prisma.session.create({
    data: {
      id: sessionId,
      identityId,
      expiresAt: new Date(Date.now() + SESSION_TTL),
      twoFactorVerified: flags.twoFactorVerified,
    },
  });
}

/**
 * Set a session as two-factor verified.
 */
export async function setSessionAsTwoFactorVerified(sessionId: string) {
  await prisma.session.update({
    where: { id: sessionId },
    data: { twoFactorVerified: true },
  });
}

/**
 * Invalidate a session record by session ID in the database.
 */
export async function invalidateSession(sessionId: string) {
  await prisma.session.delete({ where: { id: sessionId } });
}

/**
 * Invalidate all sessions for an identity by identity ID in the database.
 */
export async function invalidateIdentitySessions(identityId: string) {
  await prisma.session.deleteMany({ where: { identityId } });
}

/**
 * Invalidate all sessions for an identity by identity ID in the database except the current session.
 */
export async function invalidateIdentitySessionsExceptCurrent(
  identityId: string,
  sessionId: string,
) {
  await prisma.session.deleteMany({ where: { identityId, NOT: { id: sessionId } } });
}
