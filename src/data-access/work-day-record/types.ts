import type { Prisma } from "@prisma/client";

// ---------------------------------------------------------------------------
// Reusable select shapes and generated payload types for WorkDayRecord
// ---------------------------------------------------------------------------

/**
 * Select shape for WorkDayRecord with user relation.
 */
export const workDayRecordSelectWithUser = {
  id: true,
  date: true,
  userId: true,
  shifts: true,
  totalHours: true,
  note: true,
  tips: true,
  user: {
    select: {
      name: true,
      username: true,
      image: true,
    },
  },
} satisfies Prisma.WorkDayRecordSelect;

/**
 * Return type for queries using workDayRecordSelectWithUser.
 */
export type WorkDayRecordWithUser = Prisma.WorkDayRecordGetPayload<{
  select: typeof workDayRecordSelectWithUser;
}>;

/**
 * WorkDayRecords by date: key = date YYYY-MM-DD, value = WorkDayRecords for that date.
 */
export type WorkDayRecordsByDate = Record<string, WorkDayRecordWithUser[]>;
