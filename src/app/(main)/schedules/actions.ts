"use server";

import type { WeekSchedulePayload } from "@/app/(main)/schedules/_lib/types";
import { PERMISSIONS } from "@/constants/permissions";
import {
  deleteWorkDayRecord,
  getWorkDayRecordsByDate,
  recomputeTipsForDate,
  upsertWorkDayRecord,
} from "@/data-access/work-day-record";
import { hasPermission } from "@/utils/access-control";
import { authorizeEmployeeAction } from "@/utils/authorize-employee";
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
export async function saveWeekScheduleAction(payload: WeekSchedulePayload): Promise<ActionResult> {
  try {
    const authResult = await authorizeEmployeeAction();
    if ("error" in authResult) return authResult;

    const { user } = authResult;
    if (!hasPermission(user.role, PERMISSIONS.SCHEDULE_MANAGE)) return { error: "Unauthorized" };

    for (const day of payload) {
      const date = parseScheduleDate(day.dateStr);
      if (!date) return { error: `Invalid date: ${day.dateStr}` };

      const existingRecords = await getWorkDayRecordsByDate(date);
      const payloadUserIds = new Set(day.records.map((r) => r.userId));

      for (const record of day.records) {
        const shifts = record.shifts.map((s) => ({
          startMinutes: s.startMinutes,
          endMinutes: s.endMinutes,
          note: s.note ?? null,
        }));
        await upsertWorkDayRecord(date, record.userId, shifts, record.note);
      }

      for (const existing of existingRecords) {
        if (!payloadUserIds.has(existing.userId)) {
          await deleteWorkDayRecord(date, existing.userId);
        }
      }

      await recomputeTipsForDate(date);
    }

    revalidatePath("/schedules");
    return {};
  } catch (error) {
    console.error(error);
    return { error: "Failed to save schedule. Please try again." };
  }
}
