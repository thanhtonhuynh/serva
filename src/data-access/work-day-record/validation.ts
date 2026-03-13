import z from "zod";

export const WorkShiftSchema = z.object({
  startMinutes: z.coerce.number().min(0, "Invalid").max(1440, "Invalid"),
  endMinutes: z.coerce.number().min(0, "Invalid").max(1440, "Invalid"),
  note: z.string().nullable().optional(),
});

export const WorkDayRecordSchema = z.object({
  userId: z.string().min(1, "Required"),
  shifts: z.array(WorkShiftSchema),
  note: z.string().nullable().optional(),
});

export const DayScheduleSchema = z.object({
  dateStr: z.string().min(1, "Required"),
  records: z.array(WorkDayRecordSchema),
});

export const WeekScheduleSchema = z
  .object({
    days: z.array(DayScheduleSchema),
  })
  .transform((data) => ({
    days: data.days.map((day) => ({
      ...day,
      records: day.records.filter(
        (record) => record.shifts.length > 0 || (record.note && record.note.trim()),
      ),
    })),
  }));

export type WorkShiftInput = z.infer<typeof WorkShiftSchema>;
export type WorkDayRecordInput = z.infer<typeof WorkDayRecordSchema>;
export type DayScheduleInput = z.infer<typeof DayScheduleSchema>;
export type WeekScheduleInput = z.infer<typeof WeekScheduleSchema>;
