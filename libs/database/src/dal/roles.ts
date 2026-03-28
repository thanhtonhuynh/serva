import { prisma } from "@serva/database";
import { cache } from "react";
import "server-only";

export const getRoles = cache(async (companyId: string) => {
  return prisma.role.findMany({
    where: { companyId },
    include: {
      permissions: true,
      _count: {
        select: { operators: true },
      },
    },
    orderBy: [{ editable: "asc" }, { name: "asc" }],
  });
});

export const getRoleById = cache(async (id: string) => {
  return prisma.role.findUnique({
    where: { id },
    include: {
      permissions: true,
      _count: {
        select: { operators: true },
      },
    },
  });
});

export const getPermissions = cache(async () => {
  return prisma.permission.findMany({
    orderBy: [{ resource: "asc" }, { action: "asc" }],
  });
});

export const getPermissionsGrouped = cache(async () => {
  const permissions = await prisma.permission.findMany({
    orderBy: [{ resource: "asc" }, { action: "asc" }],
  });

  const grouped: Record<string, typeof permissions> = {};
  for (const permission of permissions) {
    if (!grouped[permission.resource]) {
      grouped[permission.resource] = [];
    }
    grouped[permission.resource].push(permission);
  }

  return grouped;
});

export async function createRole(
  companyId: string,
  data: {
    name: string;
    description?: string;
    permissionIds: string[];
  },
) {
  return prisma.role.create({
    data: {
      companyId,
      name: data.name,
      description: data.description,
      permissionIds: data.permissionIds,
    },
  });
}

export async function updateRole(
  id: string,
  data: {
    name?: string;
    description?: string;
    permissionIds?: string[];
  },
) {
  return prisma.role.update({
    where: { id },
    data,
  });
}

export async function deleteRole(id: string) {
  const role = await prisma.role.findUnique({
    where: { id },
    select: { editable: true },
  });

  if (!role) {
    throw new Error("Role not found");
  }

  if (!role.editable) {
    throw new Error("Cannot delete default roles");
  }

  return prisma.role.delete({ where: { id } });
}

export async function roleNameExists(name: string, companyId: string, excludeId?: string) {
  const role = await prisma.role.findFirst({
    where: {
      companyId,
      name: { equals: name, mode: "insensitive" },
      ...(excludeId && { id: { not: excludeId } }),
    },
  });
  return role !== null;
}
