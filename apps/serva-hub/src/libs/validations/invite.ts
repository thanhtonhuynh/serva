import { z } from "zod";

const trimmedString = z.string().trim();
const requiredString = trimmedString.min(1, "Required");

export const InviteProfileTypeSchema = z.union([z.literal("employee"), z.literal("operator")]);
export type InviteProfileType = z.infer<typeof InviteProfileTypeSchema>;

export const CreateEmployeeInviteSchema = z
  .object({
    name: requiredString,
    email: z.email("Invalid email").toLowerCase(),
    jobId: z.string().optional(),
  })
  .transform((data) => ({
    ...data,
    jobId: data.jobId || undefined,
  }));
export type CreateEmployeeInviteInput = z.input<typeof CreateEmployeeInviteSchema>;

export const CreateOperatorInviteSchema = z.object({
  name: requiredString,
  email: z.email("Invalid email").toLowerCase(),
  roleId: requiredString,
});
export type CreateOperatorInviteInput = z.infer<typeof CreateOperatorInviteSchema>;
