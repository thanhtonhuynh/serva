import { FULL_MONTHS, NUM_MONTHS } from "@/app/constants";
import { CurrentBadge } from "@/components/shared";
import { NotiMessage } from "@/components/shared/noti-message";
import { Typography } from "@/components/shared/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PERMISSIONS } from "@/constants/permissions";
import { getWorkDayRecordsByDateRange } from "@/data-access/work-day-record";
import { getCurrentSession } from "@/lib/auth/session";
import { TotalHoursTips } from "@/types";
import { hasPermission } from "@/utils/access-control";
import {
  formatInUTC,
  getCurrentMonth,
  getCurrentYear,
  getPeriodsForMonthAndYearInUTC,
} from "@/utils/datetime";
import { getHoursTipsBreakdownInDateRange, populateMonthSelectData } from "@/utils/hours-tips";
import { authenticatedRateLimit } from "@/utils/rate-limiter";
import { ArrowRight01Icon, Calendar03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { notFound, redirect } from "next/navigation";
import { DataTable, HoursTipsTable } from "./_components";

type SearchParams = Promise<{
  year?: string;
  month?: string;
}>;

export default async function Page(props: { searchParams: SearchParams }) {
  const { session, user } = await getCurrentSession();
  if (!session) redirect("/login");
  if (user.accountStatus !== "active") return notFound();
  if (!hasPermission(user.role, PERMISSIONS.HOURS_TIPS_VIEW)) return notFound();

  if (!(await authenticatedRateLimit(user.id))) {
    return <NotiMessage variant="error" message="Too many requests. Please try again later." />;
  }

  const searchParams = await props.searchParams;
  const { years } = await populateMonthSelectData();

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
      <NotiMessage
        variant="error"
        message="Year and month are required. Redirecting to current period."
      />
    );
  }

  const year = parseInt(yearParam);
  const month = parseInt(monthParam); // 1-indexed

  if (isNaN(year) || isNaN(month) || !years.includes(year) || !NUM_MONTHS.includes(month)) {
    return (
      <NotiMessage
        variant="error"
        message="Invalid year or month. Please check the URL and try again."
      />
    );
  }

  const monthIndex = month - 1; // 0-indexed
  const periods = getPeriodsForMonthAndYearInUTC(year, monthIndex);

  const [firstPeriodRecords, secondPeriodRecords] = await Promise.all([
    getWorkDayRecordsByDateRange(periods[0]),
    getWorkDayRecordsByDateRange(periods[1]),
  ]);

  const hoursTipsBreakdowns = [
    getHoursTipsBreakdownInDateRange(periods[0], firstPeriodRecords),
    getHoursTipsBreakdownInDateRange(periods[1], secondPeriodRecords),
  ];

  const totalHoursTips: TotalHoursTips[] = [];
  for (const breakdown of hoursTipsBreakdowns) {
    for (const data of breakdown.hoursBreakdown) {
      const index = totalHoursTips.findIndex((total) => total.userId === data.userId);
      if (index === -1) {
        totalHoursTips.push({
          userId: data.userId,
          name: data.userName,
          username: data.userUsername,
          image: data.image,
          totalHours: data.total,
          totalTips: 0,
        });
      } else {
        totalHoursTips[index].totalHours += data.total;
      }
    }
    for (const data of breakdown.tipsBreakdown) {
      const index = totalHoursTips.findIndex((total) => total.userId === data.userId);
      if (index === -1) {
        totalHoursTips.push({
          userId: data.userId,
          name: data.userName,
          username: data.userUsername,
          image: data.image,
          totalHours: 0,
          totalTips: data.total,
        });
      } else {
        totalHoursTips[index].totalTips += data.total;
      }
    }
  }

  const isCurrentPeriod = year === currentYear && monthIndex === currentMonth;

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
          <CardTitle>Hours</CardTitle>
        </CardHeader>

        <CardContent className="space-y-10">
          {periods.map((period, index) => (
            <div key={index} className="space-y-6">
              <Typography variant="h3" className="flex items-center gap-2">
                <HugeiconsIcon icon={Calendar03Icon} className="size-5" />
                <span>{formatInUTC(period.start, "MMM d")}</span>
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
                <span>{formatInUTC(period.end, "d")}</span>
              </Typography>

              {hoursTipsBreakdowns[index].hoursBreakdown.length > 0 ? (
                <>
                  <DataTable dateRange={period} data={hoursTipsBreakdowns[index].hoursBreakdown} />
                </>
              ) : (
                <Typography className="text-center">No record found for this period</Typography>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tips</CardTitle>
        </CardHeader>

        <CardContent className="space-y-10">
          {periods.map((period, index) => (
            <div key={index} className="space-y-6">
              <Typography variant="h3" className="flex items-center gap-2">
                <HugeiconsIcon icon={Calendar03Icon} className="size-5" />
                <span>{formatInUTC(period.start, "MMM d")}</span>
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
                <span>{formatInUTC(period.end, "d")}</span>
              </Typography>

              {hoursTipsBreakdowns[index].tipsBreakdown.length > 0 ? (
                <>
                  <DataTable
                    dateRange={period}
                    data={hoursTipsBreakdowns[index].tipsBreakdown}
                    isMoney
                  />
                </>
              ) : (
                <Typography className="text-center">No record found for this period</Typography>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
