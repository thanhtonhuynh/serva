import { PLATFORMS } from "@/constants/platforms";
import { z } from "zod";

const trimmedString = z.string().trim();
const requiredString = trimmedString.min(1, "Required");

// Update shift hours
export const UpdateShiftHoursSchema = z.object({
  monday: z.coerce.number().min(0).max(24),
  tuesday: z.coerce.number().min(0).max(24),
  wednesday: z.coerce.number().min(0).max(24),
  thursday: z.coerce.number().min(0).max(24),
  friday: z.coerce.number().min(0).max(24),
  saturday: z.coerce.number().min(0).max(24),
  sunday: z.coerce.number().min(0).max(24),
});
export type UpdateShiftHoursInput = z.infer<typeof UpdateShiftHoursSchema>;

// Update start cash
export const UpdateStartCashSchema = z.object({
  startCash: z.coerce.number().min(0),
});
export type UpdateStartCashInput = z.infer<typeof UpdateStartCashSchema>;

// Update active platforms
export const UpdateActivePlatformsSchema = z.object({
  activePlatforms: z
    .array(z.string())
    .refine(
      (value) => value.every((id) => PLATFORMS.some((p) => p.id === id)),
      { message: "Invalid platform IDs" },
    ),
});
export type UpdateActivePlatformsInput = z.infer<
  typeof UpdateActivePlatformsSchema
>;
