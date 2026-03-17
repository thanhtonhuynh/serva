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

/** WorkDayRecord shape used for hours/tips breakdown (with identity relation). */
export type WorkDayRecordForBreakdown = {
  date: Date;
  identityId: string;
  totalHours: number;
  tips: number;
  identity: { name: string; username: string; image: string | null };
};

export function getHoursTipsBreakdownInDateRange(
  dateRange: DateRange,
  workDayRecords: WorkDayRecordForBreakdown[],
) {
  const hoursMap = new Map<string, BreakdownData>();
  const tipsMap = new Map<string, BreakdownData>();

  const numDays = differenceInDays(dateRange.end, dateRange.start, { in: utc }) + 1;

  const makeEmptyRow = (record: WorkDayRecordForBreakdown): BreakdownData => ({
    identityId: record.identityId,
    identityName: record.identity.name,
    identityUsername: record.identity.username,
    identityImage: record.identity.image ?? "",
    keyData: Array(numDays).fill(0),
    total: 0,
  });

  for (const record of workDayRecords) {
    const index = differenceInDays(record.date, dateRange.start, { in: utc });

    if (index < 0 || index >= numDays) continue;

    let hoursRow = hoursMap.get(record.identityId);
    if (!hoursRow) {
      hoursRow = makeEmptyRow(record);
      hoursMap.set(record.identityId, hoursRow);
    }
    hoursRow.keyData[index] = record.totalHours;
    hoursRow.total += record.totalHours;

    let tipsRow = tipsMap.get(record.identityId);
    if (!tipsRow) {
      tipsRow = makeEmptyRow(record);
      tipsMap.set(record.identityId, tipsRow);
    }
    tipsRow.keyData[index] = record.tips;
    tipsRow.total += record.tips;
  }

  const sortByName = (a: BreakdownData, b: BreakdownData) =>
    a.identityName.localeCompare(b.identityName);

  return {
    hoursBreakdown: Array.from(hoursMap.values()).sort(sortByName),
    tipsBreakdown: Array.from(tipsMap.values()).sort(sortByName),
  };
}
