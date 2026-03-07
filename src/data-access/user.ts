import { hashPassword } from "@/lib/auth/password";
import type { User } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import type { PermissionCode } from "@/types/rbac";
import { Permission, User as PrismaUser, Role } from "@prisma/client";
import { cache } from "react";
import "server-only";

type RoleWithPermissions = Role & { permissions: Permission[] };
type UserWithRole = PrismaUser & { role: RoleWithPermissions | null };

// Create User
export async function createUser(name: string, username: string, email: string, password: string) {
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, username, email, passwordHash },
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
    },
  });
  return user as UserWithRole;
}

// Get All Users
// export async function getAllUsers() {
//   const users = await prisma.user.findMany();
//   return users as User[];
// }

// Get User By ID
export const getUserById = cache(async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
    },
  });
  return user as UserWithRole | null;
});

// Get User By Email
export const getUserByEmail = cache(async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
    },
  });
  return user as UserWithRole | null;
});

// Get User By Username
export const getUserByUsername = cache(async (username: string) => {
  const user = await prisma.user.findUnique({
    where: { username },
  });
  return user;
});

export const getUserProfileByUsername = cache(async (username: string) => {
  const user = await prisma.user.findUnique({
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

  if (!user) return null;

  return {
    ...user,
    role: {
      name: user?.role?.name ?? null,
      isAdminUser: !!user?.adminUser,
      permissions: user?.role?.permissions.map((p) => p.code as PermissionCode) ?? [],
    },
  } as User;
});

// Get User By Email Or Username
export const getUserByEmailOrUsername = cache(async (identifier: string) => {
  const user = await prisma.user.findFirst({
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
  return user as UserWithRole | null;
});

// Get User Password Hash
export const getUserPasswordHash = cache(async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
  if (!user) throw new Error("Invalid user ID");
  return user.passwordHash;
});

// Update User
export async function updateUser(
  userId: string,
  data: Partial<Omit<PrismaUser, "id" | "createdAt" | "updatedAt">>,
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
    },
  });
  return user as UserWithRole;
}

// Update User Password
export async function updateUserPassword(userId: string, password: string) {
  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}
