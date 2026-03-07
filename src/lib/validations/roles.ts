import { z } from "zod";

const trimmedString = z.string().trim();
const requiredString = trimmedString.min(1, "Required");

export const CreateRoleSchema = z.object({
  name: requiredString.max(50, "Name must be 50 characters or less"),
  description: trimmedString.max(200, "Description must be 200 characters or less").optional(),
  permissionIds: z.array(z.string()).default([]),
});
export type CreateRoleInput = z.infer<typeof CreateRoleSchema>;

export const UpdateRoleSchema = z.object({
  id: requiredString,
  name: requiredString.max(50, "Name must be 50 characters or less"),
  description: trimmedString.max(200, "Description must be 200 characters or less").optional(),
  permissionIds: z.array(z.string()).default([]),
});
export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>;
