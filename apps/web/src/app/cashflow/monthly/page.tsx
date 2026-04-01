import { FULL_MONTHS, NUM_MONTHS } from "@/app/constants";
import { authGuardWithRateLimit, hasSessionPermission } from "@serva/auth/authorize";
import { populateMonthSelectData } from "@/utils/hours-tips";
import { getReportsByDateRange } from "@serva/database/dal";
import {
  PERMISSIONS,
  getCurrentMonth,
  getCurrentYear,
  getDateRangeForMonthAndYearInUTC,
  getPlatformById,
  processCashFlowData,
  type Platform,
} from "@serva/shared";
import { Callout, Card, CardContent, CardHeader, CardTitle, CurrentBadge } from "@serva/serva-ui";
import { notFound } from "next/navigation";
import { MonthlyCashFlowTable } from "../_components";

type SearchParams = Promise<{
  year?: string;
  month?: string;
}>;

export default async function MonthlyPage(props: { searchParams: SearchParams }) {
  const { companyCtx } = await authGuardWithRateLimit();
  if (!(await hasSessionPermission(PERMISSIONS.CASHFLOW_VIEW))) return notFound();

  const searchParams = await props.searchParams;
  const { years } = await populateMonthSelectData(companyCtx.companyId);

  const currentYear = getCurrentYear();
  const currentMonth = getCurrentMonth(); // 0-indexed
  let selectedYear = currentYear;
  let selectedMonth = currentMonth;

  // Validate and parse year
  if (searchParams.year) {
    const year = parseInt(searchParams.year);

    if (isNaN(year) || !years.includes(year)) {
      return <Callout variant="error" message="Invalid year. No data available for this year." />;
    }
    selectedYear = year;
  }

  // Validate and parse month
  if (searchParams.month) {
    const month = parseInt(searchParams.month); // 1-indexed

    if (isNaN(month) || !NUM_MONTHS.includes(month)) {
      return (
        <Callout variant="error" message="Invalid month. Please check the URL and try again." />
      );
    }
    selectedMonth = month - 1; // 0-indexed
  }

  // Fetch monthly data
  const dateRange = getDateRangeForMonthAndYearInUTC(selectedYear, selectedMonth); // 0-indexed
  const reports = await getReportsByDateRange(companyCtx.companyId, dateRange);
  const processedReports = processCashFlowData(reports);

  // Derive platforms from actual data
  const platformIdsUsed = new Set<string>();
  for (const report of reports) {
    for (const ps of report.platformSales) {
      platformIdsUsed.add(ps.platformId);
    }
  }
  const platformsInData = [...platformIdsUsed]
    .map((id) => getPlatformById(id))
    .filter((p): p is Platform => p !== undefined);

  const isCurrentPeriod = selectedYear === currentYear && selectedMonth === currentMonth;

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {FULL_MONTHS[selectedMonth]} {selectedYear}
          {isCurrentPeriod && <CurrentBadge />}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <MonthlyCashFlowTable reports={processedReports} platforms={platformsInData} />
      </CardContent>
    </Card>
  );
}
