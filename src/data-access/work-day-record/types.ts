import type { Prisma } from "@prisma/client";

// ---------------------------------------------------------------------------
// Reusable select shapes and generated payload types for WorkDayRecord
// ---------------------------------------------------------------------------

/**
 * Select shape for WorkDayRecord with identity relation.
 */
export const workDayRecordSelectWithIdentity = {
  id: true,
  date: true,
  identityId: true,
  shifts: true,
  totalHours: true,
  tips: true,
  identity: {
    select: {
      name: true,
      username: true,
      image: true,
    },
  },
} satisfies Prisma.WorkDayRecordSelect;

/**
 * Return type for queries using workDayRecordSelectWithIdentity.
 */
export type WorkDayRecordWithIdentity = Prisma.WorkDayRecordGetPayload<{
  select: typeof workDayRecordSelectWithIdentity;
}>;

/**
 * WorkDayRecords by date: key = date YYYY-MM-DD, value = WorkDayRecords for that date.
 */
export type WorkDayRecordsByDate = Record<string, WorkDayRecordWithIdentity[]>;
