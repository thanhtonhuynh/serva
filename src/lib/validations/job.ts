import { z } from "zod";

const trimmedString = z.string().trim();
const requiredString = trimmedString.min(1, "Required");

export const CreateJobSchema = z.object({
  name: requiredString,
});
export type CreateJobInput = z.infer<typeof CreateJobSchema>;

export const UpdateJobSchema = z.object({
  jobId: requiredString,
  name: requiredString,
});
export type UpdateJobInput = z.infer<typeof UpdateJobSchema>;
