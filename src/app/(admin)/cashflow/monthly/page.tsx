import { FULL_MONTHS, NUM_MONTHS } from "@/app/constants";
import { CurrentBadge } from "@/components/shared";
import { NotiMessage } from "@/components/shared/noti-message";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PERMISSIONS } from "@/constants/permissions";
import { type Platform, getPlatformById } from "@/constants/platforms";
import { getReportsByDateRange } from "@/data-access/report";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/utils/access-control";
import { processCashFlowData } from "@/utils/cashflow";
import {
  getCurrentMonth,
  getCurrentYear,
  getDateRangeForMonthAndYearInUTC,
} from "@/utils/datetime";
import { populateMonthSelectData } from "@/utils/hours-tips";
import { authenticatedRateLimit } from "@/utils/rate-limiter";
import { notFound, redirect } from "next/navigation";
import { MonthlyCashFlowTable } from "../_components";

type SearchParams = Promise<{
  year?: string;
  month?: string;
}>;

export default async function MonthlyPage(props: { searchParams: SearchParams }) {
  const { session, user } = await getCurrentSession();
  if (!session) redirect("/login");
  if (user.accountStatus !== "active") return notFound();
  if (!hasPermission(user.role, PERMISSIONS.CASHFLOW_VIEW)) return notFound();

  if (!(await authenticatedRateLimit(user.id))) {
    return <NotiMessage variant="error" message="Too many requests. Please try again later." />;
  }

  const searchParams = await props.searchParams;
  const { years } = await populateMonthSelectData();

  const currentYear = getCurrentYear();
  const currentMonth = getCurrentMonth(); // 0-indexed
  let selectedYear = currentYear;
  let selectedMonth = currentMonth;

  // Validate and parse year
  if (searchParams.year) {
    const year = parseInt(searchParams.year);

    if (isNaN(year) || !years.includes(year)) {
      return (
        <NotiMessage variant="error" message="Invalid year. No data available for this year." />
      );
    }
    selectedYear = year;
  }

  // Validate and parse month
  if (searchParams.month) {
    const month = parseInt(searchParams.month); // 1-indexed

    if (isNaN(month) || !NUM_MONTHS.includes(month)) {
      return (
        <NotiMessage variant="error" message="Invalid month. Please check the URL and try again." />
      );
    }
    selectedMonth = month - 1; // 0-indexed
  }

  // Fetch monthly data
  const dateRange = getDateRangeForMonthAndYearInUTC(selectedYear, selectedMonth); // 0-indexed
  const reports = await getReportsByDateRange(dateRange);
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
