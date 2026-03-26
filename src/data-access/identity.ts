import { hashPassword } from "@/lib/auth/password";
import type { Identity } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { type Identity as PrismaIdentity } from "@prisma/client";
import { cache } from "react";
import "server-only";

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
          where: { companyId },
          select: { role: { select: { name: true } } },
          take: 1,
        },
        employees: {
          where: { companyId },
          select: { job: { select: { name: true } } },
          take: 1,
        },
      },
    });

    if (!identity) return null;

    const roleName = identity.operators[0]?.role?.name ?? identity.employees[0]?.job?.name ?? null;

    return {
      ...identity,
      isPlatformAdmin: !!identity.adminUser,
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
