import type { DateRange } from "@/types/datetime";
import { TZDate } from "@date-fns/tz";
import { utc } from "@date-fns/utc";
import {
  addDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  parse,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";

const timeZone = "America/Vancouver";

/**
 * Formats a date in UTC timezone.
 */
export function formatInUTC(date: Date | string, formatStr: string = "yyyy-MM-dd"): string {
  return format(date, formatStr, { in: utc });
}

/**
 * Parse a date from a string in UTC timezone.
 */
export function parseInUTC(dateStr: string): Date {
  return parse(dateStr, "yyyy-MM-dd", new Date(), { in: utc });
}

/**
 * Get Jan 1 of the given year at UTC midnight.
 */
export function getStartOfYearUTC(year: number): Date {
  return new Date(Date.UTC(year, 0, 1));
}

/**
 * Get Dec 31 23:59:59.999 of the given year in UTC.
 */
export function getEndOfYearUTC(year: number): Date {
  return new Date(Date.UTC(year, 11, 31));
}

/**
 * Get today's date (in timeZone) as a UTC midnight Date.
 * Should work for both server and client side.
 */
export function getTodayUTCMidnight(): Date {
  const now = new TZDate(Date.now(), timeZone);
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

/**
 * Get current biweekly period.
 * Should return 1-15 or 16-end of the month.
 */
export function getCurrentBiweeklyPeriodInUTC(): DateRange {
  const now = getTodayUTCMidnight();

  if (now.getDate() <= 15) {
    return {
      start: startOfMonth(now, { in: utc }),
      end: new Date(Date.UTC(now.getFullYear(), now.getMonth(), 15)),
    };
  } else {
    return {
      start: new Date(Date.UTC(now.getFullYear(), now.getMonth(), 16)),
      end: endOfMonth(now, { in: utc }),
    };
  }
}

/**
 * @deprecated Use getTodayUTCMidnight() instead.
 */
export function getTodayStartOfDay(): Date {
  return getTodayUTCMidnight();
}

/**
 * Get current year in Vancouver timezone.
 */
export function getCurrentYear(): number {
  return new TZDate(Date.now(), timeZone).getFullYear();
}

/**
 * Get current month (0-indexed) in Vancouver timezone.
 */
export function getCurrentMonth(): number {
  return new TZDate(Date.now(), timeZone).getMonth();
}

/**
 * Get date range for a given month and year.
 * Month is 0-indexed.
 */
export function getDateRangeForMonthAndYearInUTC(year: number, month: number): DateRange {
  return {
    start: new Date(Date.UTC(year, month, 1)),
    end: new Date(Date.UTC(year, month + 1, 0)),
  };
}

/**
 * Get biweekly periods for a given month and year.
 * Month is 0-indexed.
 */
export function getPeriodsForMonthAndYearInUTC(year: number, month: number): DateRange[] {
  return [
    {
      start: new Date(Date.UTC(year, month, 1)),
      end: new Date(Date.UTC(year, month, 15)),
    },
    {
      start: new Date(Date.UTC(year, month, 16)),
      end: new Date(Date.UTC(year, month + 1, 0)),
    },
  ];
}

/**
 * Get date range for a given year.
 */
export function getDateRangeForYearInUTC(year: number): DateRange {
  return {
    start: new Date(Date.UTC(year, 0, 1)),
    end: new Date(Date.UTC(year, 11, 31)),
  };
}

/**
 * Get start of week (Monday 00:00) of the week containing the given date, in UTC.
 * The date is interpreted as a calendar date (YYYY-MM-DD), so week math is done in UTC
 * to avoid timezone shifting the day.
 */
export function getStartOfWeekUTC(date: Date | string): Date {
  return startOfWeek(date, { weekStartsOn: 1, in: utc });
}

/**
 * Get end of week (Sunday 23:59:59.999) of the week containing the given date, in UTC.
 * The date is interpreted as a calendar date (YYYY-MM-DD), so week math is done in UTC
 * to avoid timezone shifting the day.
 */
export function getEndOfWeekUTC(date: Date | string): Date {
  return endOfWeek(date, { weekStartsOn: 1, in: utc });
}

/**
 * Get start of day (00:00) of the given date, in UTC.
 */
export function getStartOfDayUTC(date: Date | string): Date {
  return startOfDay(date, { in: utc });
}

/**
 * Get end of day (23:59:59.999) of the given date, in UTC.
 */
export function getEndOfDayUTC(date: Date | string): Date {
  return endOfDay(date, { in: utc });
}

/**
 * Build week dates for a given week start date, in UTC.
 */
export function buildWeekDatesUTC(weekStartUTC: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStartUTC, i));
}
