import type { PERMISSIONS } from "@/constants/permissions";
import type { Permission, Role as PrismaRole } from "@serva/database";

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Simplified role type for use in session context
export type Role = {
  name: string | null;
  permissions: PermissionCode[];
};

// Role with permissions included
export type RoleWithPermissions = PrismaRole & {
  permissions: Permission[];
};

// Role with permissions and count of operators (RBAC); employees use jobs, not roles
export type RoleWithDetails = PrismaRole & {
  permissions: Permission[];
  _count: { operators: number };
};
