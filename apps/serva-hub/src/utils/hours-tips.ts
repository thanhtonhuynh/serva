import { utc } from "@date-fns/utc";
import { getFirstReportDate } from "@serva/database/dal";
import { BreakdownData, getCurrentYear, type DateRange } from "@serva/shared";
import { differenceInDays } from "date-fns";
import { cache } from "react";

export const populateMonthSelectData = cache(async (companyId: string) => {
  const firstReportDate = await getFirstReportDate(companyId);

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

/** WorkDayRecord shape used for hours/tips breakdown (with employee → identity). */
export type WorkDayRecordForBreakdown = {
  date: Date;
  employeeId: string;
  totalHours: number;
  tips: number;
  employee: { identity: { name: string; image: string | null } };
};

export function getHoursTipsBreakdownInDateRange(
  dateRange: DateRange,
  workDayRecords: WorkDayRecordForBreakdown[],
) {
  const hoursMap = new Map<string, BreakdownData>();
  const tipsMap = new Map<string, BreakdownData>();

  const numDays = differenceInDays(dateRange.end, dateRange.start, { in: utc }) + 1;

  const makeEmptyRow = (record: WorkDayRecordForBreakdown): BreakdownData => ({
    employeeId: record.employeeId,
    name: record.employee.identity.name,
    image: record.employee.identity.image ?? "",
    keyData: Array(numDays).fill(0),
    total: 0,
  });

  for (const record of workDayRecords) {
    const index = differenceInDays(record.date, dateRange.start, { in: utc });

    if (index < 0 || index >= numDays) continue;

    let hoursRow = hoursMap.get(record.employeeId);
    if (!hoursRow) {
      hoursRow = makeEmptyRow(record);
      hoursMap.set(record.employeeId, hoursRow);
    }
    hoursRow.keyData[index] = record.totalHours;
    hoursRow.total += record.totalHours;

    let tipsRow = tipsMap.get(record.employeeId);
    if (!tipsRow) {
      tipsRow = makeEmptyRow(record);
      tipsMap.set(record.employeeId, tipsRow);
    }
    tipsRow.keyData[index] = record.tips;
    tipsRow.total += record.tips;
  }

  const sortByName = (a: BreakdownData, b: BreakdownData) => a.name.localeCompare(b.name);

  return {
    hoursBreakdown: Array.from(hoursMap.values()).sort(sortByName),
    tipsBreakdown: Array.from(tipsMap.values()).sort(sortByName),
  };
}
