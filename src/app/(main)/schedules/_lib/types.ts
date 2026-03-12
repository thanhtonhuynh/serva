/** A single work shift within a day. */
export type ShiftFormValue = {
  startMinutes: number;
  endMinutes: number;
  note?: string;
};

/** Alias: one work shift for form/serialization. */
export type WorkShiftFormValue = ShiftFormValue;

/** One employee's WorkDayRecord for a single day (form value). */
export type EntryFormValue = {
  userId: string;
  shifts: ShiftFormValue[];
  note?: string;
};

/** Alias: one WorkDayRecord for one day, used in the week grid form. */
export type WorkDayRecordFormValue = EntryFormValue;

/** One day column in the week grid: date key + one WorkDayRecord per employee (by row). */
export type DayFormValue = {
  dateStr: string; // YYYY-MM-DD (UTC)
  entries: EntryFormValue[]; // one entry per employee row = one WorkDayRecord per (date, employee)
};

/** The entire week form: 7 days, each with records per employee. */
export type WeekFormValues = {
  days: DayFormValue[];
};

// ---------------------------------------------------------------------------
// Save action payload (WorkDayRecord-based)
// ---------------------------------------------------------------------------

/** One WorkDayRecord to save (userId + shifts + note). */
export type WorkDayRecordPayload = {
  userId: string;
  shifts: WorkShiftFormValue[];
  note?: string | null;
};

/** One day's payload: date string + records to upsert for that date. */
export type DaySchedulePayload = {
  dateStr: string;
  records: WorkDayRecordPayload[];
};

/** Full week payload for saveWeekScheduleAction. */
export type WeekSchedulePayload = DaySchedulePayload[];

/** Identifier for a shift in the grid: day index, entry index, shift index. */
export type ShiftAddress = {
  dayIndex: number;
  entryIndex: number;
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
