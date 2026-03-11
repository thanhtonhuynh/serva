import type { WorkDayRecordsByDate } from "@/app/(main)/schedules/_lib/types";
import type { getWorkDayRecordsByDateRange } from "@/data-access/work-day-record";
import { WorkShift } from "@prisma/client";
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
  // If there are no tips or no work day records, return an empty array
  if (totalTipsCents <= 0 || workDayRecords.length === 0) {
    return workDayRecords.map((r) => ({ id: r.id, tips: 0 }));
  }

  // Compute the total hours worked by all employees
  const totalHours = workDayRecords.reduce(
    (acc, r) => acc + (r.totalHours > 0 ? r.totalHours : 0),
    0,
  );

  // If the total hours worked is 0, return an empty array
  if (totalHours <= 0) {
    return workDayRecords.map((r) => ({ id: r.id, tips: 0 }));
  }

  // Compute tips using half-up rounding based on each employee's hours worked
  // proportional to the total hours worked
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
  workDayRecords: Awaited<ReturnType<typeof getWorkDayRecordsByDateRange>>,
  weekStartUTC: Date,
): WorkDayRecordsByDate {
  const weekDates = buildWeekDatesUTC(weekStartUTC);
  const byDate: WorkDayRecordsByDate = {};

  for (const weekDate of weekDates) {
    const dateKey = formatInUTC(weekDate);
    const dayRecords = workDayRecords.filter((r) => isSameDay(r.date, weekDate));
    byDate[dateKey] = dayRecords;
  }

  return byDate;
}
