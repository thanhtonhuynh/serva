import { getFirstReportDate } from "@/data-access/report";
import { BreakdownData } from "@/types";
import type { DateRange } from "@/types/datetime";
import { utc } from "@date-fns/utc";
import { differenceInDays } from "date-fns";
import { cache } from "react";
import { getCurrentYear } from "./datetime";

export const populateMonthSelectData = cache(async () => {
  const firstReportDate = await getFirstReportDate();

  if (!firstReportDate)
    return {
      years: [],
    };

  const currentYear = getCurrentYear();
  const firstYear = firstReportDate.getUTCFullYear();

  const years: number[] = [];
  let year = firstYear;
  while (year <= currentYear) {
    years.push(year);
    year++;
  }
  years.reverse();

  return {
    years,
  };
});

/** WorkDayRecord shape used for hours/tips breakdown (with user relation). */
export type WorkDayRecordForBreakdown = {
  date: Date;
  userId: string;
  totalHours: number;
  tips: number;
  user: { name: string; username: string; image: string | null };
};

export function getHoursTipsBreakdownInDateRange(
  dateRange: DateRange,
  workDayRecords: WorkDayRecordForBreakdown[],
) {
  const hoursMap = new Map<string, BreakdownData>();
  const tipsMap = new Map<string, BreakdownData>();

  const numDays = differenceInDays(dateRange.end, dateRange.start, { in: utc }) + 1;

  const makeEmptyRow = (record: WorkDayRecordForBreakdown): BreakdownData => ({
    userId: record.userId,
    userName: record.user.name,
    userUsername: record.user.username,
    image: record.user.image ?? "",
    keyData: Array(numDays).fill(0),
    total: 0,
  });

  for (const record of workDayRecords) {
    const index = differenceInDays(record.date, dateRange.start, { in: utc });

    if (index < 0 || index >= numDays) continue;

    let hoursRow = hoursMap.get(record.userId);
    if (!hoursRow) {
      hoursRow = makeEmptyRow(record);
      hoursMap.set(record.userId, hoursRow);
    }
    hoursRow.keyData[index] = record.totalHours;
    hoursRow.total += record.totalHours;

    let tipsRow = tipsMap.get(record.userId);
    if (!tipsRow) {
      tipsRow = makeEmptyRow(record);
      tipsMap.set(record.userId, tipsRow);
    }
    tipsRow.keyData[index] = record.tips;
    tipsRow.total += record.tips;
  }

  const sortByName = (a: BreakdownData, b: BreakdownData) => a.userName.localeCompare(b.userName);

  return {
    hoursBreakdown: Array.from(hoursMap.values()).sort(sortByName),
    tipsBreakdown: Array.from(tipsMap.values()).sort(sortByName),
  };
}
