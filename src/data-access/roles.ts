import prisma from "@/lib/prisma";
import { cache } from "react";
import "server-only";

// Get all roles
export const getRoles = cache(async () => {
  return prisma.role.findMany({
    include: {
      permissions: true,
      _count: {
        select: { users: true },
      },
    },
    orderBy: [{ editable: "asc" }, { name: "asc" }],
  });
});

// Get a single role by ID
export const getRoleById = cache(async (id: string) => {
  return prisma.role.findUnique({
    where: { id },
    include: {
      permissions: true,
      _count: {
        select: { users: true },
      },
    },
  });
});

// Get all permissions
export const getPermissions = cache(async () => {
  return prisma.permission.findMany({
    orderBy: [{ resource: "asc" }, { action: "asc" }],
  });
});

// Get permissions grouped by resource
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

// Create a new role
export async function createRole(data: {
  name: string;
  description?: string;
  permissionIds: string[];
}) {
  return prisma.role.create({
    data: {
      name: data.name,
      description: data.description,
      permissionIds: data.permissionIds,
    },
  });
}

// Update a role
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

// Delete a role (only non-default roles)
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

// Check if role name already exists
export async function roleNameExists(name: string, excludeId?: string) {
  const role = await prisma.role.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      ...(excludeId && { id: { not: excludeId } }),
    },
  });
  return role !== null;
}
