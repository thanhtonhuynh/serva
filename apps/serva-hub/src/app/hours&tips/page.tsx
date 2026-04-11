import { FULL_MONTHS, NUM_MONTHS } from "@/constants";
import { authWithRateLimit, hasSessionPermission } from "@/libs/auth";
import { getHoursTipsBreakdownInDateRange, populateMonthSelectData } from "@/utils/hours-tips";
import { ArrowRight01Icon, Calendar03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { getWorkDayRecordsByDateRange } from "@serva/database/dal";
import {
  Callout,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CurrentBadge,
  Typography,
} from "@serva/serva-ui";
import {
  PERMISSIONS,
  TotalHoursTips,
  formatInUTC,
  getCurrentMonth,
  getCurrentYear,
  getPeriodsForMonthAndYearInUTC,
} from "@serva/shared";
import { addDays } from "date-fns";
import { notFound, redirect } from "next/navigation";
import type { ExportPeriodPayload } from "./_components";
import { ExportPeriodButton, HoursTipsPeriodTable, HoursTipsTable } from "./_components";

type SearchParams = Promise<{
  year?: string;
  month?: string;
}>;

export default async function Page(props: { searchParams: SearchParams }) {
  const { companyCtx } = await authWithRateLimit();
  if (!(await hasSessionPermission(PERMISSIONS.HOURS_TIPS_VIEW))) return notFound();

  const searchParams = await props.searchParams;
  const { years } = await populateMonthSelectData(companyCtx.companyId);

  const currentYear = getCurrentYear();
  const currentMonth = getCurrentMonth();

  // Redirect to current month when no params
  if (!searchParams.year && !searchParams.month) {
    redirect(`/hours&tips?year=${currentYear}&month=${currentMonth + 1}`);
  }

  // Validate year
  const yearParam = searchParams.year;
  const monthParam = searchParams.month;

  if (!yearParam || !monthParam) {
    return (
      <Callout
        variant="error"
        message="Year and month are required. Redirecting to current period."
      />
    );
  }

  const year = parseInt(yearParam);
  const month = parseInt(monthParam); // 1-indexed

  if (isNaN(year) || isNaN(month) || !years.includes(year) || !NUM_MONTHS.includes(month)) {
    return (
      <Callout
        variant="error"
        message="Invalid year or month. Please check the URL and try again."
      />
    );
  }

  const monthIndex = month - 1; // 0-indexed
  const periods = getPeriodsForMonthAndYearInUTC(year, monthIndex);

  const [firstPeriodRecords, secondPeriodRecords] = await Promise.all([
    getWorkDayRecordsByDateRange(companyCtx.companyId, periods[0]),
    getWorkDayRecordsByDateRange(companyCtx.companyId, periods[1]),
  ]);

  const hoursTipsBreakdowns = [
    getHoursTipsBreakdownInDateRange(periods[0], firstPeriodRecords),
    getHoursTipsBreakdownInDateRange(periods[1], secondPeriodRecords),
  ] as const;

  const totalHoursTips: TotalHoursTips[] = [];
  for (const breakdown of hoursTipsBreakdowns) {
    for (const data of breakdown.hoursBreakdown) {
      const index = totalHoursTips.findIndex((total) => total.employeeId === data.employeeId);
      if (index === -1) {
        totalHoursTips.push({
          employeeId: data.employeeId,
          name: data.name,
          image: data.image,
          totalHours: data.total,
          totalTips: 0,
        });
      } else {
        const row = totalHoursTips[index];
        if (row !== undefined) row.totalHours += data.total;
      }
    }
    for (const data of breakdown.tipsBreakdown) {
      const index = totalHoursTips.findIndex((total) => total.employeeId === data.employeeId);
      if (index === -1) {
        totalHoursTips.push({
          employeeId: data.employeeId,
          name: data.name,
          image: data.image,
          totalHours: 0,
          totalTips: data.total,
        });
      } else {
        const row = totalHoursTips[index];
        if (row !== undefined) row.totalTips += data.total;
      }
    }
  }

  const isCurrentPeriod = year === currentYear && monthIndex === currentMonth;
  const monthYearLabel = `${FULL_MONTHS[monthIndex]}-${year}`;

  function buildExportPayload(periodIndex: 0 | 1): ExportPeriodPayload {
    const period = periods[periodIndex];
    const breakdown = hoursTipsBreakdowns[periodIndex];
    const startDay = period.start.getUTCDate();
    const endDay = period.end.getUTCDate();
    const dayHeaders = Array.from(
      { length: endDay - startDay + 1 },
      (_, i) => `${formatInUTC(addDays(period.start, i), "EEE")} ${startDay + i}`,
    );
    return {
      periodLabel: `${formatInUTC(period.start, "MMM d")} - ${formatInUTC(period.end, "d")}`,
      dayHeaders,
      hoursBreakdown: breakdown.hoursBreakdown,
      tipsBreakdown: breakdown.tipsBreakdown,
      monthYearLabel,
    };
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {FULL_MONTHS[monthIndex]} {year}
            {isCurrentPeriod && <CurrentBadge />}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <HoursTipsTable data={totalHoursTips} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Breakdown</CardTitle>
        </CardHeader>

        <CardContent className="space-y-10">
          {([0, 1] as const).map((periodIndex) => {
            const period = periods[periodIndex];
            const breakdown = hoursTipsBreakdowns[periodIndex];
            const hoursData = breakdown.hoursBreakdown;
            const tipsData = breakdown.tipsBreakdown;
            const hasData = hoursData.length > 0 || tipsData.length > 0;

            return (
              <div key={periodIndex} className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Typography variant="h3" className="flex items-center gap-2">
                    <HugeiconsIcon icon={Calendar03Icon} className="size-5" />
                    <span>{formatInUTC(period.start, "MMM d")}</span>
                    <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
                    <span>{formatInUTC(period.end, "d")}</span>
                  </Typography>
                  <ExportPeriodButton payload={buildExportPayload(periodIndex)} />
                </div>

                {hasData ? (
                  <HoursTipsPeriodTable
                    dateRange={period}
                    hoursData={hoursData}
                    tipsData={tipsData}
                  />
                ) : (
                  <Typography className="text-center">No record found for this period</Typography>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
