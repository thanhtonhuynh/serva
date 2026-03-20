import { hashPassword } from "@/lib/auth/password";
import type { Identity } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { type Identity as PrismaIdentity } from "@prisma/client";
import { cache } from "react";
import "server-only";

// Create an identity.
export async function createIdentity(
  name: string,
  username: string,
  email: string,
  password: string,
) {
  const passwordHash = await hashPassword(password);
  return prisma.identity.create({
    data: { name, username, email, passwordHash, accountStatus: "active" },
  });
}

// Get an identity by id.
export const getIdentityById = cache(async (identityId: string) => {
  return prisma.identity.findUnique({
    where: { id: identityId },
  });
});

// Get an identity by email.
export const getIdentityByEmail = cache(async (email: string) => {
  return prisma.identity.findUnique({
    where: { email },
  });
});

// Get an identity by username.
export const getIdentityByUsername = cache(async (username: string) => {
  return prisma.identity.findUnique({
    where: { username },
  });
});

/**
 * Get an identity by username in a specific company.
 */
export const getIdentityProfileInCompany = cache(
  async (username: string, companyId: string): Promise<Identity | null> => {
    const identity = await prisma.identity.findUnique({
      where: {
        username,
        OR: [{ operators: { some: { companyId } } }, { employees: { some: { companyId } } }],
      },
      include: {
        adminUser: { select: { id: true } },
      },
    });

    if (!identity) return null;

    return {
      ...identity,
      isPlatformAdmin: !!identity.adminUser,
    };
  },
);

// Get an identity by email or username.
export const getIdentityByEmailOrUsername = cache(async (identifier: string) => {
  return prisma.identity.findFirst({
    where: {
      OR: [{ email: identifier }, { username: identifier }],
    },
  });
});

// Get an identity's password hash.
export const getIdentityPasswordHash = cache(async (identityId: string) => {
  const identity = await prisma.identity.findUnique({
    where: { id: identityId },
    select: { passwordHash: true },
  });
  if (!identity) throw new Error("Invalid identity ID");
  return identity.passwordHash;
});

// Update an identity.
export async function updateIdentity(
  identityId: string,
  data: Partial<Omit<PrismaIdentity, "id" | "createdAt" | "updatedAt">>,
) {
  return prisma.identity.update({
    where: { id: identityId },
    data,
  });
}

// Update an identity's password.
export async function updateIdentityPassword(identityId: string, password: string) {
  const passwordHash = await hashPassword(password);
  await prisma.identity.update({
    where: { id: identityId },
    data: { passwordHash },
  });
}
