import { hashPassword } from "@/lib/auth/password";
import type { Identity } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import type { PermissionCode } from "@/types/rbac";
import { Permission, Role, type Identity as PrismaIdentity } from "@prisma/client";
import { cache } from "react";
import "server-only";

type RoleWithPermissions = Role & { permissions: Permission[] };
type IdentityWithRole = PrismaIdentity & { role: RoleWithPermissions | null };

// Create Identity
export async function createIdentity(
  name: string,
  username: string,
  email: string,
  password: string,
) {
  const passwordHash = await hashPassword(password);
  const identity = await prisma.identity.create({
    data: { name, username, email, passwordHash },
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
    },
  });
  return identity as IdentityWithRole;
}

// Get Identity By ID
export const getIdentityById = cache(async (identityId: string) => {
  const identity = await prisma.identity.findUnique({
    where: { id: identityId },
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
    },
  });
  return identity as IdentityWithRole | null;
});

// Get User By Email
export const getIdentityByEmail = cache(async (email: string) => {
  const identity = await prisma.identity.findUnique({
    where: { email },
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
    },
  });
  return identity as IdentityWithRole | null;
});

// Get User By Username
export const getIdentityByUsername = cache(async (username: string) => {
  const identity = await prisma.identity.findUnique({
    where: { username },
  });
  return identity;
});

export const getIdentityProfileByUsername = cache(async (username: string) => {
  const identity = await prisma.identity.findUnique({
    where: { username },
    include: {
      role: {
        select: {
          name: true,
          permissions: { select: { code: true } },
        },
      },
      adminUser: { select: { id: true } },
    },
  });

  if (!identity) return null;

  return {
    ...identity,
    role: {
      name: identity?.role?.name ?? null,
      isAdminUser: !!identity?.adminUser,
      permissions: identity?.role?.permissions.map((p) => p.code as PermissionCode) ?? [],
    },
  } as Identity;
});

// Get User By Email Or Username
export const getIdentityByEmailOrUsername = cache(async (identifier: string) => {
  const identity = await prisma.identity.findFirst({
    where: {
      OR: [{ email: identifier }, { username: identifier }],
    },
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
    },
  });
  return identity as IdentityWithRole | null;
});

// Get User Password Hash
export const getIdentityPasswordHash = cache(async (identityId: string) => {
  const identity = await prisma.identity.findUnique({
    where: { id: identityId },
    select: { passwordHash: true },
  });
  if (!identity) throw new Error("Invalid identity ID");
  return identity.passwordHash;
});

// Update User
export async function updateIdentity(
  identityId: string,
  data: Partial<Omit<PrismaIdentity, "id" | "createdAt" | "updatedAt">>,
) {
  const identity = await prisma.identity.update({
    where: { id: identityId },
    data,
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
    },
  });
  return identity as IdentityWithRole;
}

// Update User Password
export async function updateIdentityPassword(identityId: string, password: string) {
  const passwordHash = await hashPassword(password);
  await prisma.identity.update({
    where: { id: identityId },
    data: { passwordHash },
  });
}
