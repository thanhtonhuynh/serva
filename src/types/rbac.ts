import type { PERMISSIONS } from "@/constants/permissions";
import type { Permission, Role } from "@prisma/client";

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// User role context (stored in session for efficient checks)
export type UserRole = {
  name: string | null;
  isAdminUser: boolean;
  permissions: PermissionCode[];
};

// Role with permissions included
export type RoleWithPermissions = Role & {
  permissions: Permission[];
};

export type RoleWithDetails = Role & {
  permissions: Permission[];
  _count: { users: number };
};
