import z from "zod";

export type WorkShiftInput = {
  startMinutes: number;
  endMinutes: number;
  note?: string;
};

export type WorkDayRecordInput = {
  userId: string;
  shifts: WorkShiftInput[];
  note?: string;
};

export type DayScheduleInput = {
  dateStr: string;
  records: WorkDayRecordInput[];
};

export const WeekScheduleSchema = z
  .object({
    days: z.array(
      z.object({
        dateStr: z.string().min(1, "Required"),
        records: z.array(
          z.object({
            userId: z.string().min(1, "Required"),
            shifts: z.array(
              z.object({
                startMinutes: z.coerce.number().min(0, "Invalid").max(1440, "Invalid"),
                endMinutes: z.coerce.number().min(0, "Invalid").max(1440, "Invalid"),
                note: z.string().optional(),
              }),
            ),
            note: z.string().optional(),
          }),
        ),
      }),
    ),
  })
  .transform((data) => ({
    days: data.days.map((day) => ({
      ...day,
      records: day.records.filter(
        (record) => record.shifts.length > 0 || (record.note && record.note.trim()),
      ),
    })),
  }));

export type WeekScheduleInput = z.infer<typeof WeekScheduleSchema>;
