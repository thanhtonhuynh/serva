import type { WorkDayRecordsByDate } from "@/data-access/work-day-record";
import type { DayScheduleInput, WeekScheduleInput, WorkDayRecordInput } from "@/lib/validations";
import type { DisplayEmployee } from "@serva/shared";
import { computeTotalHours } from "@/utils/work-day-record";

/** Identifier for a shift in the grid: day index, entry index, shift index. */
export type ShiftAddress = {
  dayIndex: number;
  recordIndex: number;
  shiftIndex: number;
};

/** Minutes since midnight to "h:mm a" (e.g. 540 -> "9:00 AM") */
export function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

/** "HH:mm" to minutes since midnight */
export function timeToMinutes(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Minutes since midnight to "HH:mm" for input[type=time] */
export function minutesToTimeInput(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/**
 * Build initial form values from WorkDayRecords by date and employee list.
 */
export function buildInitialWeekScheduleInput(
  weekDates: string[],
  recordsByDate: WorkDayRecordsByDate,
  employees: DisplayEmployee[],
): WeekScheduleInput {
  const days: DayScheduleInput[] = weekDates.map((dateStr) => {
    const dayRecords = recordsByDate[dateStr] ?? [];

    const records: WorkDayRecordInput[] = employees.map((emp) => {
      const record = dayRecords.find((r) => r.employeeId === emp.id);
      return record || { employeeId: emp.id, shifts: [] };
    });

    return { dateStr, records };
  });

  return { days };
}

/**
 * Total hours for one employee across the week (from form days).
 */
export function getEmployeeWeekHours(watchedDays: DayScheduleInput[], recordIdx: number): number {
  let total = 0;
  for (const day of watchedDays) {
    const record = day.records[recordIdx];
    if (record?.shifts?.length) {
      total += computeTotalHours(record.shifts);
    }
  }
  return total;
}
