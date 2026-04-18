import { prisma, type Identity as PrismaIdentity } from "@serva/database";
import { buildUniqueCompaniesFromAccounts } from "@serva/shared";
import type { Identity } from "@serva/shared/types";
import { cache } from "react";
import "server-only";
import { hashPassword } from "./password";

export type IdentityProfile = Identity & {
  roleName: string | null;
};

/**
 * Create an identity.
 */
export async function createIdentity(name: string, email: string, password: string) {
  const passwordHash = await hashPassword(password);
  return prisma.identity.create({
    data: { name, email, passwordHash, accountStatus: "active" },
  });
}

/**
 * Set profile image from OAuth only when the identity has no image yet (preserve user uploads).
 */
export async function applyOAuthProfilePictureIfEmpty(
  identityId: string,
  currentImage: string | null | undefined,
  picture: string | null | undefined,
) {
  const trimmed = picture?.trim();
  if (!trimmed) return;
  if (currentImage && currentImage.trim().length > 0) return;
  await prisma.identity.update({
    where: { id: identityId },
    data: { image: trimmed },
  });
}

/**
 * Get an identity by ID.
 */
export const getIdentityById = cache(async (identityId: string) => {
  return prisma.identity.findUnique({ where: { id: identityId } });
});

/**
 * Get an identity by email.
 */
export const getIdentityByEmail = cache(async (email: string) => {
  return prisma.identity.findUnique({ where: { email } });
});

/**
 * Resolve an identity by email for OAuth linking: try normalized lowercase, then case-insensitive match.
 */
export async function findIdentityByEmailForOAuth(email: string) {
  const trimmed = email.trim();
  const lower = trimmed.toLowerCase();
  return (
    (await prisma.identity.findUnique({ where: { email: lower } })) ??
    (await prisma.identity.findFirst({
      where: { email: { equals: trimmed, mode: "insensitive" } },
    }))
  );
}

/**
 * Get an identity's profile within a specific company, including role name
 * from their operator or employee record.
 */
export const getIdentityProfileInCompanyByEmail = cache(
  async (email: string, companyId: string): Promise<IdentityProfile | null> => {
    const identity = await prisma.identity.findUnique({
      where: {
        email,
        OR: [{ operators: { some: { companyId } } }, { employees: { some: { companyId } } }],
      },
      include: {
        adminUser: { select: { id: true } },
        operators: {
          select: {
            company: { select: { id: true, name: true, slug: true } },
            role: { select: { name: true } },
          },
        },
        employees: {
          select: {
            company: { select: { id: true, name: true, slug: true } },
            job: { select: { name: true } },
          },
        },
      },
    });

    if (!identity) return null;

    const companies = buildUniqueCompaniesFromAccounts(identity.operators, identity.employees);
    const companyCount = companies.length;
    const roleName =
      identity.operators.find((o) => o.company.id === companyId)?.role?.name ??
      identity.employees.find((e) => e.company.id === companyId)?.job?.name ??
      null;

    return {
      id: identity.id,
      name: identity.name,
      email: identity.email,
      emailVerified: identity.emailVerified,
      accountStatus: identity.accountStatus,
      image: identity.image,
      createdAt: identity.createdAt,
      updatedAt: identity.updatedAt,
      isPlatformAdmin: !!identity.adminUser,
      companyCount,
      roleName,
    };
  },
);

/**
 * Get an identity's password hash.
 */
export const getIdentityPasswordHash = cache(async (identityId: string) => {
  const identity = await prisma.identity.findUnique({
    where: { id: identityId },
    select: { passwordHash: true },
  });
  if (!identity) throw new Error("Invalid identity ID");
  return identity.passwordHash;
});

/**
 * Update an identity's data.
 */
export async function updateIdentity(
  identityId: string,
  data: Partial<Omit<PrismaIdentity, "id" | "createdAt" | "updatedAt">>,
) {
  return prisma.identity.update({
    where: { id: identityId },
    data,
  });
}

/**
 * Update an identity's password.
 */
export async function updateIdentityPassword(identityId: string, password: string) {
  const passwordHash = await hashPassword(password);
  await prisma.identity.update({
    where: { id: identityId },
    data: { passwordHash },
  });
}
