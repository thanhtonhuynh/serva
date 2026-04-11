"use server";

import { authorizeAction, hasSessionPermission } from "@/libs/auth";
import { WeekScheduleSchema, type WeekScheduleInput } from "@/libs/validations";
import { recomputeTipsForDateRange, replaceWeekSchedule } from "@serva/database/dal";
import { PERMISSIONS } from "@serva/shared";
import type { DateRange } from "@serva/shared/types";
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
    const authResult = await authorizeAction();
    if ("error" in authResult) return authResult;

    if (!(await hasSessionPermission(PERMISSIONS.SCHEDULE_MANAGE)))
      return { error: "Unauthorized" };

    const { companyCtx } = authResult;
    const payload = WeekScheduleSchema.parse(input);

    await replaceWeekSchedule(companyCtx.companyId, dateRange, payload.days);
    await recomputeTipsForDateRange(companyCtx.companyId, dateRange);

    revalidatePath("/schedules");
    return {};
  } catch (error) {
    return { error: "Failed to save schedule. Please try again." };
  }
}
