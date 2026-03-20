import type { Employee, Operator } from "@/lib/auth/session";
import type { PermissionCode, Role } from "@/types/rbac";

/**
 * Build a simplified role object with flattened permissions.
 */
export function buildSimplifiedRole(
  role: { name: string; permissions: { code: string }[] } | null,
): Role {
  return {
    name: role?.name ?? null,
    permissions: role?.permissions.map((p) => p.code as PermissionCode) ?? [],
  };
}

/**
 * Merge permissions from operator and employee roles.
 */
export function mergePermissions(
  operator: Operator | null,
  employee: Employee | null,
): PermissionCode[] {
  const permissions = new Set<PermissionCode>();
  operator?.role.permissions.forEach((p) => permissions.add(p));
  employee?.role.permissions.forEach((p) => permissions.add(p));
  return [...permissions];
}
