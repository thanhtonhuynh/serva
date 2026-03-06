"use server";

import { PERMISSIONS } from "@/constants/permissions";
import {
  type DayEntryInput,
  deleteScheduleDay,
  upsertScheduleDay,
} from "@/data-access/schedule";
import { hasPermission } from "@/utils/access-control";
import { authorizeEmployeeAction } from "@/utils/authorize-employee";
import { revalidatePath } from "next/cache";

type ActionResult = { error?: string };

type DayPayload = {
  dateStr: string; // YYYY-MM-DD
  entries: DayEntryInput[];
};

function parseScheduleDate(dateStr: string): Date | null {
  const d = new Date(dateStr + "T00:00:00.000Z");
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

/** True if the day has at least one entry with slots (should be upserted). */
function dayHasEntriesWithSlots(day: DayPayload): boolean {
  return day.entries.some((e) => e.slots && e.slots.length > 0);
}

/**
 * Persist an entire week's schedule in one request.
 * Each item in `days` contains a date string and the full entries array for that day.
 * Days with at least one entry that has slots are upserted; days with no such entries
 * are removed from the DB so that deleting or moving all slots clears the schedule day.
 */
export async function saveWeekScheduleAction(
  days: DayPayload[],
): Promise<ActionResult> {
  try {
    const authResult = await authorizeEmployeeAction();
    if ("error" in authResult) return authResult;

    const { user } = authResult;
    if (!hasPermission(user.role, PERMISSIONS.SCHEDULE_MANAGE))
      return { error: "Unauthorized" };

    for (const day of days) {
      const date = parseScheduleDate(day.dateStr);
      if (!date) return { error: `Invalid date: ${day.dateStr}` };

      if (dayHasEntriesWithSlots(day)) {
        await upsertScheduleDay(date, day.entries);
      } else {
        await deleteScheduleDay(date);
      }
    }

    revalidatePath("/schedules");
    return {};
  } catch (error) {
    console.error(error);
    return { error: "Failed to save schedule. Please try again." };
  }
}
