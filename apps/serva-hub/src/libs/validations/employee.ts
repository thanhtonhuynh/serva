import { z } from "zod";

const trimmedString = z.string().trim();
const requiredString = trimmedString.min(1, "Required");

/** Operator RBAC role change (Admin / Manager — stored on `Operator.roleId`). */
export const UpdateOperatorRoleSchema = z.object({
  identityId: requiredString,
  roleId: requiredString,
});
export type UpdateOperatorRoleInput = z.infer<typeof UpdateOperatorRoleSchema>;

/** @deprecated Use `UpdateOperatorRoleSchema` — employees use `jobId`, not RBAC roles. */
export const UpdateEmployeeRoleSchema = UpdateOperatorRoleSchema;
export type UpdateEmployeeRoleInput = UpdateOperatorRoleInput;

export const UpdateEmployeeJobSchema = z.object({
  employeeId: requiredString,
  /** Job id, or `__none__` to clear. */
  jobId: z.string(),
});
export type UpdateEmployeeJobInput = z.infer<typeof UpdateEmployeeJobSchema>;
