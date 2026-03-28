import type {
  WorkDayRecordsByDate,
  WorkDayRecordWithEmployee,
} from "@/data-access/work-day-record";
import { WorkShift } from "@serva/database";
import { isSameDay } from "date-fns";
import { buildWeekDatesUTC, formatInUTC } from "./datetime";

/**
 * Compute the total hours from a list of shifts.
 */
export function computeTotalHours(
  shifts: Pick<WorkShift, "startMinutes" | "endMinutes">[],
): number {
  const totalMinutes = shifts.reduce((acc, shift) => {
    const duration = shift.endMinutes - shift.startMinutes;
    if (duration <= 0) return acc;
    return acc + duration;
  }, 0);

  const hours = totalMinutes / 60;
  return Math.round(hours * 100) / 100;
}

/**
 * Distribute tips among employees based on their hours worked.
 */
export function distributeTips(
  workDayRecords: { id: string; totalHours: number }[],
  totalTipsCents: number,
): { id: string; tips: number }[] {
  if (totalTipsCents <= 0 || workDayRecords.length === 0) {
    return workDayRecords.map((r) => ({ id: r.id, tips: 0 }));
  }

  const totalHours = workDayRecords.reduce(
    (acc, r) => acc + (r.totalHours > 0 ? r.totalHours : 0),
    0,
  );

  if (totalHours <= 0) {
    return workDayRecords.map((r) => ({ id: r.id, tips: 0 }));
  }

  return workDayRecords.map((r) => {
    const ratio = r.totalHours / totalHours;
    const tips = Math.round(ratio * totalTipsCents);
    return { id: r.id, tips };
  });
}

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
