import { WorkShift } from "@prisma/client";

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
