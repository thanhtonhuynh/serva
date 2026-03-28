import type { Prisma } from "@serva/database";

/**
 * Select shape for WorkDayRecord with employee → identity relation.
 */
export const workDayRecordSelectWithEmployee = {
  id: true,
  date: true,
  employeeId: true,
  shifts: true,
  totalHours: true,
  tips: true,
  employee: {
    select: {
      identity: { select: { name: true, image: true } },
    },
  },
} satisfies Prisma.WorkDayRecordSelect;

/**
 * Return type for queries using workDayRecordSelectWithEmployee.
 */
export type WorkDayRecordWithEmployee = Prisma.WorkDayRecordGetPayload<{
  select: typeof workDayRecordSelectWithEmployee;
}>;

/**
 * WorkDayRecords by date: key = date YYYY-MM-DD, value = WorkDayRecords for that date.
 */
export type WorkDayRecordsByDate = Record<string, WorkDayRecordWithEmployee[]>;
