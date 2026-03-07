import { PERMISSIONS } from "@/constants/permissions";
import type { PermissionCode, UserRole } from "@/types/rbac";

/**
 * Check if a user has a specific permission based on their role
 * This is the primary function for checking permissions (uses cached session data)
 */
export function hasPermission(
  role: UserRole | null | undefined,
  permissionCode: PermissionCode,
): boolean {
  if (!role) return false;

  // Platform super admins bypass all permission checks
  if (role.isAdminUser) return true;

  // Store admins have all permissions
  // This is safe as there is only one store admin role
  if (role.name === "Admin") return true;

  return role.permissions.includes(permissionCode);
}

/**
 * Check if a user can update another user's role
 * Super admins and users with roles.manage permission can update any role
 * Users cannot assign roles with more permissions than they have
 */
export function hasAssignRolePermission(
  role: UserRole | null | undefined,
  targetRole: { id: string; name: string; permissions: { code: string }[] } | null,
): boolean {
  if (!role) return false;

  // Super admins can assign any role
  if (role.isAdminUser) return true;

  // Store admins can assign any role
  if (role.name === "Admin") return true;

  // Must have team.assign_roles permission
  if (!role.permissions.includes(PERMISSIONS.TEAM_ASSIGN_ROLES)) return false;

  // If target role is admin, the user must be an admin
  if (targetRole?.name === "Admin") return role.name === "Admin";

  // Check if user has all the permissions that the target role has
  const targetPermissions = targetRole?.permissions.map((p) => p.code as PermissionCode) ?? [];
  return targetPermissions.every((p) => role.permissions.includes(p));
}
