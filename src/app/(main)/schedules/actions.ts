"use server";

import { PERMISSIONS } from "@/constants/permissions";
import { recomputeTipsForDateRange, replaceWeekSchedule } from "@/data-access/work-day-record/dal";
import { WeekScheduleSchema, type WeekScheduleInput } from "@/lib/validations";
import type { DateRange } from "@/types/datetime";
import { hasPermission } from "@/utils/access-control";
import { authorizeEmployeeAction } from "@/utils/authorize-employee";
import { revalidatePath } from "next/cache";

type ActionResult = { error?: string };

/**
 * Persist an entire week's schedule as WorkDayRecords.
 * Atomically replaces all records in the date range, then recomputes tips.
 */
export async function saveWeekScheduleAction(
  dateRange: DateRange,
  input: WeekScheduleInput,
): Promise<ActionResult> {
  try {
    const authResult = await authorizeEmployeeAction();
    if ("error" in authResult) return authResult;

    const { identity } = authResult;
    if (!hasPermission(identity.role, PERMISSIONS.SCHEDULE_MANAGE))
      return { error: "Unauthorized" };

    const payload = WeekScheduleSchema.parse(input);

    await replaceWeekSchedule(dateRange, payload.days);
    await recomputeTipsForDateRange(dateRange);

    revalidatePath("/schedules");
    return {};
  } catch (error) {
    return { error: "Failed to save schedule. Please try again." };
  }
}
