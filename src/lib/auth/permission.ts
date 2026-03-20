import { PERMISSIONS } from "@/constants/permissions";
import type { CompanyContext, Identity } from "@/lib/auth/session";
import type { PermissionCode } from "@/types/rbac";

/**
 * Check if an identity has a specific permission in a company context.
 * Uses merged permissions from operator + employee roles.
 * Platform admins and company-level Admins bypass all checks.
 */
export function hasPermission(
  identity: Identity | null,
  companyCtx: CompanyContext | null,
  permissionCode: PermissionCode,
): boolean {
  if (!companyCtx || !identity) return false;

  // Platform admins bypass all permission checks
  if (identity.isPlatformAdmin) return true;

  // Company-level Admin role (either operator or employee side)
  if (companyCtx.operator?.role.name === "Admin" || companyCtx.employee?.role.name === "Admin")
    return true;

  return companyCtx.permissions.includes(permissionCode);
}

/**
 * Check if the identity can assign a target role in a company context.
 * Platform admins and company-level Admins can assign any role.
 */
export function hasAssignRolePermission(
  identity: Identity,
  companyCtx: CompanyContext | null,
  targetRole: { id: string; name: string; permissions: { code: string }[] } | null,
): boolean {
  if (!companyCtx) return false;

  // Platform admins bypass all permission checks
  if (identity.isPlatformAdmin) return true;

  // Company-level Admin role (either operator or employee side)
  if (companyCtx.operator?.role.name === "Admin" || companyCtx.employee?.role.name === "Admin")
    return true;

  // Check if the identity has the permission to assign roles
  if (!companyCtx.permissions.includes(PERMISSIONS.TEAM_ASSIGN_ROLES)) return false;

  if (targetRole?.name === "Admin") return false;

  // Check if the identity has all the permissions of the target role
  const targetPermissions = targetRole?.permissions.map((p) => p.code as PermissionCode) ?? [];
  return targetPermissions.every((p) => companyCtx.permissions.includes(p));
}
