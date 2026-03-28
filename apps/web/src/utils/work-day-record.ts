import type { WorkDayRecordsByDate, WorkDayRecordWithEmployee } from "@serva/database";
import { buildWeekDatesUTC, formatInUTC } from "@serva/shared";
import { isSameDay } from "date-fns";

/**
 * Build records-by-date map from flat WorkDayRecord[] for the week (7 days from weekStartUTC).
 */
export function buildWorkDayRecordsByDate(
  workDayRecords: WorkDayRecordWithEmployee[],
  weekStartUTC: Date,
): WorkDayRecordsByDate {
  const weekDates = buildWeekDatesUTC(weekStartUTC);
  const recordsByDate: WorkDayRecordsByDate = {};

  for (const weekDate of weekDates) {
    const dateKey = formatInUTC(weekDate);
    const records = workDayRecords.filter((r) => isSameDay(r.date, weekDate));
    recordsByDate[dateKey] = records;
  }

  return recordsByDate;
}
