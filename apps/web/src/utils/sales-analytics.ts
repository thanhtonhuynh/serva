import { monthLabels } from "@/types/datetime";
import { utc } from "@date-fns/utc";
import { addDays, getMonth, getWeek } from "date-fns";
import { formatInUTC, getCurrentYear, getEndOfYearUTC, getStartOfYearUTC } from "./datetime";

// CHANGE ALL MOMENT USAGE TO DATE-FNS

export type DaySalesData = {
  date: Date;
  totalSales: number;
};

export type HeatmapCell = {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  totalSales: number;
  hasReport: boolean;
  intensity: number; // 0-4 scale for color intensity
  dayOfWeek: number; // 0 = Monday, 6 = Sunday
  weekIndex: number;
  formattedDate: string; // "Monday, January 20, 2026"
};

export type SalesAnalytics = {
  ytdTotalSales: number;
  bestSalesMonth: { month: string; totalSales: number } | null;
  bestSalesDay: {
    date: string;
    formattedDate: string;
    totalSales: number;
  } | null;
  lowestSalesDay: {
    date: string;
    formattedDate: string;
    totalSales: number;
  } | null;
  averageDailySales: number;
  reportCount: number;
};

export type HeatmapData = {
  cells: HeatmapCell[];
  months: { name: string; weekStart: number }[];
  maxSales: number;
  minSales: number;
};

/**
 * Generate heatmap data for a given year
 */
export function generateHeatmapData(year: number, reports: DaySalesData[]): HeatmapData {
  const reportMap = new Map<string, number>();
  let maxSales = 0;
  let minSales = Infinity;

  // Build a map of date -> totalSales
  // Also track max and min sales for intensity calculation
  for (const report of reports) {
    const dateStr = formatInUTC(report.date);
    reportMap.set(dateStr, report.totalSales);
    if (report.totalSales > 0) {
      maxSales = Math.max(maxSales, report.totalSales);
      minSales = Math.min(minSales, report.totalSales);
    }
  }

  if (minSales === Infinity) minSales = 0;

  // Populate heatmap cells
  const cells = populateHeatmapCells(year, reportMap, maxSales);

  // Calculate month positions for labels
  const months: { name: string; weekStart: number }[] = [];

  for (let m = 0; m < 12; m++) {
    // Find all cells in this month
    const monthCells = cells.filter((c) => {
      const cellMonth = getMonth(c.date, { in: utc });
      return cellMonth === m;
    });

    // Find the weekIndex of the first and last cell in the month
    if (monthCells.length > 0) {
      const weekStart = monthCells[0].weekIndex;

      months.push({
        name: monthLabels[m],
        weekStart,
      });
    }
  }

  return { cells, months, maxSales, minSales };
}

/**
 * Populate cells data for heatmap
 */
function populateHeatmapCells(
  year: number,
  reportMap: Map<string, number>,
  maxSales: number,
): HeatmapCell[] {
  const startOfYear = getStartOfYearUTC(year);
  const endOfYear = getEndOfYearUTC(year);

  const cells: HeatmapCell[] = [];
  let current = startOfYear;

  let weekIndex = 0;
  let previousWeekOfYear = -1;

  while (current <= endOfYear) {
    const dateStr = formatInUTC(current);
    const totalSales = reportMap.get(dateStr) ?? 0;
    const hasReport = reportMap.has(dateStr);
    const dayOfWeek = (current.getUTCDay() + 6) % 7; // Monday = 0, Sunday = 6
    const weekOfYear = getWeek(current, { weekStartsOn: 1, in: utc });

    // Increment week index when we encounter a new week
    if (weekOfYear !== previousWeekOfYear) {
      if (previousWeekOfYear !== -1) weekIndex++;
      previousWeekOfYear = weekOfYear;
    }

    // Calculate intensity (0-4 scale)
    // If no report or zero sales, intensity = 0
    let intensity = 0;
    if (hasReport && totalSales > 0 && maxSales > 0) {
      const ratio = totalSales / maxSales;
      if (ratio > 0.75) intensity = 4;
      else if (ratio > 0.5) intensity = 3;
      else if (ratio > 0.25) intensity = 2;
      else intensity = 1;
    }

    cells.push({
      date: current,
      dateStr,
      totalSales,
      hasReport,
      intensity, // for color intensity
      dayOfWeek, // for row placement
      weekIndex, // for column placement
      formattedDate: formatInUTC(current, "EEEE, MMMM d, yyyy"),
    });

    current = addDays(current, 1, { in: utc });
  }

  return cells;
}

/**
 * Calculate sales analytics for a given year
 */
export function calculateSalesAnalytics(reports: DaySalesData[]): SalesAnalytics {
  // Filter out zero-sales reports for calculations
  const validReports = reports.filter((r) => r.totalSales > 0);

  if (validReports.length === 0) {
    return {
      ytdTotalSales: 0,
      bestSalesMonth: null,
      bestSalesDay: null,
      lowestSalesDay: null,
      averageDailySales: 0,
      reportCount: 0,
    };
  }

  // YTD Total Sales
  const ytdTotalSales = validReports.reduce((sum, r) => sum + r.totalSales, 0);

  // Best Sales Day
  const sortedByHighest = [...validReports].sort((a, b) => b.totalSales - a.totalSales);
  const bestDay = sortedByHighest[0];
  const bestSalesDay = {
    date: formatInUTC(bestDay.date),
    formattedDate: formatInUTC(bestDay.date, "MMM d, yyyy"),
    totalSales: bestDay.totalSales,
  };

  // Lowest Sales Day
  const lowestDay = sortedByHighest[sortedByHighest.length - 1];
  const lowestSalesDay = {
    date: formatInUTC(lowestDay.date),
    formattedDate: formatInUTC(lowestDay.date, "MMM d, yyyy"),
    totalSales: lowestDay.totalSales,
  };

  // Best Sales Month
  const monthTotals = new Map<string, number>();
  for (const report of validReports) {
    const monthKey = formatInUTC(report.date, "yyyy-MM");
    const current = monthTotals.get(monthKey) ?? 0;
    monthTotals.set(monthKey, current + report.totalSales);
  }

  let bestMonth: { month: string; totalSales: number } | null = null;
  for (const [monthKey, total] of monthTotals) {
    if (!bestMonth || total > bestMonth.totalSales) {
      bestMonth = {
        month: formatInUTC(new Date(`${monthKey}-01T00:00:00.000Z`), "MMMM"),
        totalSales: total,
      };
    }
  }

  // Average Daily Sales (excluding zero-sales days)
  const averageDailySales = ytdTotalSales / validReports.length;

  return {
    ytdTotalSales,
    bestSalesMonth: bestMonth,
    bestSalesDay,
    lowestSalesDay,
    averageDailySales,
    reportCount: validReports.length,
  };
}

/**
 * Get available years for the year selector
 */
export function getAvailableYears(firstReportDate: Date | null): number[] {
  const currentYear = getCurrentYear();
  const startYear = firstReportDate ? firstReportDate.getUTCFullYear() : currentYear;

  const years: number[] = [];
  for (let y = currentYear; y >= startYear; y--) {
    years.push(y);
  }

  return years;
}
