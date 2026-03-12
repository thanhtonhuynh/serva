"use server";

import { PERMISSIONS } from "@/constants/permissions";
import {
  deleteWorkDayRecordsByUserIds,
  getWorkDayRecordsByDateRange,
  WeekScheduleSchema,
  type WeekScheduleInput,
} from "@/data-access/work-day-record";
import { recomputeTipsForDate, upsertWorkDayRecord } from "@/data-access/work-day-record/dal";
import type { DateRange } from "@/types/datetime";
import { hasPermission } from "@/utils/access-control";
import { authorizeEmployeeAction } from "@/utils/authorize-employee";
import { buildWorkDayRecordsByDate } from "@/utils/work-day-record";
import { revalidatePath } from "next/cache";

type ActionResult = { error?: string };

function parseScheduleDate(dateStr: string): Date | null {
  const d = new Date(dateStr + "T00:00:00.000Z");
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

/**
 * Persist an entire week's schedule as WorkDayRecords.
 * For each day: upsert one WorkDayRecord per payload record; delete records for employees
 * no longer present; then recompute tips for that date if a report exists.
 */
export async function saveWeekScheduleAction(
  dateRange: DateRange,
  payload: WeekScheduleInput,
): Promise<ActionResult> {
  try {
    const authResult = await authorizeEmployeeAction();
    if ("error" in authResult) return authResult;

    const { user } = authResult;
    if (!hasPermission(user.role, PERMISSIONS.SCHEDULE_MANAGE)) return { error: "Unauthorized" };

    // Parse payload
    const parsedPayload = WeekScheduleSchema.parse(payload);

    // Get existing records
    const existingRecords = await getWorkDayRecordsByDateRange(dateRange);
    const existingRecordsByDate = buildWorkDayRecordsByDate(existingRecords, dateRange.start);

    // Process each day in the payload
    for (const day of parsedPayload.days) {
      const date = parseScheduleDate(day.dateStr);
      if (!date) return { error: `Invalid date: ${day.dateStr}` };

      // Get unique user ids from the payload for this day
      const payloadUserIds = new Set(day.records.map((r) => r.userId));

      for (const record of day.records) {
        await upsertWorkDayRecord(date, {
          userId: record.userId,
          shifts: record.shifts,
          note: record.note,
        });
      }

      // Delete records for employees no longer present on this day
      const existingRecordsForDate = existingRecordsByDate[day.dateStr];
      const existingRecordsUserIds = new Set(existingRecordsForDate.map((r) => r.userId));
      const userIdsToDelete = Array.from(existingRecordsUserIds).filter(
        (userId) => !payloadUserIds.has(userId),
      );
      await deleteWorkDayRecordsByUserIds(date, userIdsToDelete);

      await recomputeTipsForDate(date);
    }

    revalidatePath("/schedules");
    return {};
  } catch (error) {
    return { error: "Failed to save schedule. Please try again." };
  }
}
