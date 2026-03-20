import { CurrentBadge } from "@/components/shared";
import { ErrorMessage } from "@/components/shared/noti-message";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PERMISSIONS } from "@/constants/permissions";
import { type Platform, getPlatformById } from "@/constants/platforms";
import { getExpensesByYear } from "@/data-access/expenses";
import { getReportsByDateRange } from "@/data-access/report";
import { authGuardWithRateLimit, hasSessionPermission } from "@/lib/auth/authorize";
import { processYearCashFlowData } from "@/utils/cashflow";
import { getCurrentYear, getDateRangeForYearInUTC } from "@/utils/datetime";
import { populateMonthSelectData } from "@/utils/hours-tips";
import { notFound } from "next/navigation";
import { YearCashFlowTable } from "../_components";

type SearchParams = Promise<{
  year?: string;
}>;

export default async function YearlyPage(props: { searchParams: SearchParams }) {
  await authGuardWithRateLimit();
  if (!(await hasSessionPermission(PERMISSIONS.CASHFLOW_VIEW))) return notFound();

  const searchParams = await props.searchParams;
  const { years } = await populateMonthSelectData();

  const currentYear = getCurrentYear();
  let selectedYear = currentYear;

  // Validate and parse year
  if (searchParams.year) {
    const year = parseInt(searchParams.year);

    if (isNaN(year) || !years.includes(year)) {
      return (
        <ErrorMessage
          className="self-start"
          message="Invalid year. No data available for this year."
        />
      );
    }
    selectedYear = year;
  }

  // Fetch yearly data
  const yearDateRange = getDateRangeForYearInUTC(selectedYear);
  const [yearReports, yearMainExpenses] = await Promise.all([
    getReportsByDateRange(yearDateRange),
    getExpensesByYear(selectedYear),
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
