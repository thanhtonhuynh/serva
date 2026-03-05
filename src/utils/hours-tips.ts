import { getFirstReportDate } from "@/data-access/report";
import { BreakdownData, Shift } from "@/types";
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

export function getHoursTipsBreakdownInDateRange(dateRange: DateRange, shifts: Shift[]) {
  const hoursMap = new Map<string, BreakdownData>();
  const tipsMap = new Map<string, BreakdownData>();

  const numDays = differenceInDays(dateRange.end, dateRange.start, { in: utc }) + 1;

  const makeEmptyRow = (shift: Shift): BreakdownData => ({
    userId: shift.userId,
    userName: shift.userName,
    userUsername: shift.userUsername,
    image: shift.userImage,
    keyData: Array(numDays).fill(0),
    total: 0,
  });

  for (const shift of shifts) {
    // Compute the index by true day difference, not day-of-month
    const index = differenceInDays(shift.date, dateRange.start, { in: utc });

    // If for some reason the shift is out of range, skip it
    if (index < 0 || index >= numDays) continue;

    // HOURS
    let hoursRow = hoursMap.get(shift.userId);
    if (!hoursRow) {
      hoursRow = makeEmptyRow(shift);
      hoursMap.set(shift.userId, hoursRow);
    }
    hoursRow.keyData[index] = shift.hours;
    hoursRow.total += shift.hours;

    // TIPS
    let tipsRow = tipsMap.get(shift.userId);
    if (!tipsRow) {
      tipsRow = makeEmptyRow(shift);
      tipsMap.set(shift.userId, tipsRow);
    }
    tipsRow.keyData[index] = shift.tips;
    tipsRow.total += shift.tips;
  }

  const sortByName = (a: BreakdownData, b: BreakdownData) => a.userName.localeCompare(b.userName);

  return {
    hoursBreakdown: Array.from(hoursMap.values()).sort(sortByName),
    tipsBreakdown: Array.from(tipsMap.values()).sort(sortByName),
  };
}
