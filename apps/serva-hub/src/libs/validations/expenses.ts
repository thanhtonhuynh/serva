import { z } from "zod";

const trimmedString = z.string().trim();
const requiredString = trimmedString.min(1, "Required");

export const ExpensesFormSchema = z.object({
  date: z.date(),
  entries: z
    .object({
      amount: z.coerce.number().gt(0, "Invalid"),
      reason: requiredString,
    })
    .array()
    .min(1, "At least 1 entry is required"),
});
export type ExpensesFormInput = z.input<typeof ExpensesFormSchema>;
export type { ExpensesFormOutput } from "@serva/shared/types";
