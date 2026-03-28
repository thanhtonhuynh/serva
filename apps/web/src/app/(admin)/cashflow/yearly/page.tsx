import { Callout, CurrentBadge } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@serva/ui/components/card";
import { authGuardWithRateLimit, hasSessionPermission } from "@/lib/auth/authorize";
import { populateMonthSelectData } from "@/utils/hours-tips";
import { getExpensesByYear, getReportsByDateRange } from "@serva/database";
import {
  PERMISSIONS,
  getCurrentYear,
  getDateRangeForYearInUTC,
  getPlatformById,
  processYearCashFlowData,
  type Platform,
} from "@serva/shared";
import { notFound } from "next/navigation";
import { YearCashFlowTable } from "../_components";

type SearchParams = Promise<{
  year?: string;
}>;

export default async function YearlyPage(props: { searchParams: SearchParams }) {
  const { companyCtx } = await authGuardWithRateLimit();
  if (!(await hasSessionPermission(PERMISSIONS.CASHFLOW_VIEW))) return notFound();

  const searchParams = await props.searchParams;
  const { years } = await populateMonthSelectData(companyCtx.companyId);

  const currentYear = getCurrentYear();
  let selectedYear = currentYear;

  // Validate and parse year
  if (searchParams.year) {
    const year = parseInt(searchParams.year);

    if (isNaN(year) || !years.includes(year)) {
      return <Callout variant="error" message="Invalid year. No data available for this year." />;
    }
    selectedYear = year;
  }

  // Fetch yearly data
  const yearDateRange = getDateRangeForYearInUTC(selectedYear);
  const [yearReports, yearMainExpenses] = await Promise.all([
    getReportsByDateRange(companyCtx.companyId, yearDateRange),
    getExpensesByYear(companyCtx.companyId, selectedYear),
  ]);
  const yearProcessedReports = processYearCashFlowData(yearReports, yearMainExpenses);

  // Derive platforms from actual data
  const platformIdsUsed = new Set<string>();
  for (const report of yearReports) {
    for (const ps of report.platformSales) {
      platformIdsUsed.add(ps.platformId);
    }
  }
  const platformsInData = [...platformIdsUsed]
    .map((id) => getPlatformById(id))
    .filter((p): p is Platform => p !== undefined);

  const isCurrentYear = selectedYear === currentYear;

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Year {selectedYear} Summary
          {isCurrentYear && <CurrentBadge />}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <YearCashFlowTable data={yearProcessedReports} platforms={platformsInData} />
      </CardContent>
    </Card>
  );
}
