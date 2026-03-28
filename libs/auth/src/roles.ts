import type { PermissionCode, Role } from "@serva/shared";
import type { Employee, Operator } from "./session";

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
 * Effective permissions in company context: operator RBAC only.
 * Employees are gated by having an employee record (see route guards), not by Role on Employee.
 */
export function mergePermissions(
  operator: Operator | null,
  _employee: Employee | null,
): PermissionCode[] {
  const permissions = new Set<PermissionCode>();
  operator?.role.permissions.forEach((p) => permissions.add(p));
  return [...permissions];
}
