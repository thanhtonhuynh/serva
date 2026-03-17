import { UserShiftTable } from "@/app/(main)/my-shifts/_components";
import { FULL_MONTHS, NUM_MONTHS } from "@/app/constants";
import { CurrentBadge, Typography } from "@/components/shared";
import { NotiMessage } from "@/components/shared/noti-message";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ICONS } from "@/constants/icons";
import { getWorkDayRecordsByIdentityAndDateRange } from "@/data-access/work-day-record/dal";
import { getCurrentSession } from "@/lib/auth/session";
import { formatMoney } from "@/lib/utils";
import {
  formatInUTC,
  getCurrentMonth,
  getCurrentYear,
  getDateRangeForMonthAndYearInUTC,
  getPeriodsForMonthAndYearInUTC,
} from "@/utils/datetime";
import { populateMonthSelectData } from "@/utils/hours-tips";
import { authenticatedRateLimit } from "@/utils/rate-limiter";
import { ArrowRight01Icon, Calendar03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { notFound, redirect } from "next/navigation";

type SearchParams = Promise<{
  year?: string;
  month?: string;
}>;

export default async function Page(props: { searchParams: SearchParams }) {
  const { identity } = await getCurrentSession();
  if (!identity) redirect("/login");
  if (identity.accountStatus !== "active") return notFound();

  if (!(await authenticatedRateLimit(identity.id))) {
    return <NotiMessage variant="error" message="Too many requests. Please try again later." />;
  }

  const searchParams = await props.searchParams;
  const { years } = await populateMonthSelectData();

  const currentYear = getCurrentYear();
  const currentMonth = getCurrentMonth();

  if (!searchParams.year || !searchParams.month) {
    redirect(`/my-shifts?year=${currentYear}&month=${currentMonth + 1}`);
  }

  const selectedYear = parseInt(searchParams.year);
  const selectedMonth = parseInt(searchParams.month); // 1-indexed

  if (
    isNaN(selectedYear) ||
    isNaN(selectedMonth) ||
    !years.includes(selectedYear) ||
    !NUM_MONTHS.includes(selectedMonth)
  ) {
    return (
      <NotiMessage
        variant="error"
        message="Invalid year or month. Please check the URL and try again."
      />
    );
  }

  const monthIndex = selectedMonth - 1; // 0-indexed
  const dateRange = getDateRangeForMonthAndYearInUTC(selectedYear, monthIndex);
  const periods = getPeriodsForMonthAndYearInUTC(selectedYear, monthIndex);
  const workDayRecords = await getWorkDayRecordsByIdentityAndDateRange(identity.id, dateRange);

  const userShifts = workDayRecords.map((r) => ({
    date: r.date,
    hours: r.totalHours,
    tips: r.tips,
  }));

  const firstPeriodShifts = userShifts.filter((shift) => shift.date.getUTCDate() <= 15);
  const secondPeriodShifts = userShifts.filter((shift) => shift.date.getUTCDate() > 15);

  const isCurrentPeriod = selectedYear === currentYear && monthIndex === currentMonth;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {FULL_MONTHS[monthIndex]} {selectedYear}
            {isCurrentPeriod && <CurrentBadge />}
          </CardTitle>
        </CardHeader>

        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <div className="bg-muted flex size-10 items-center justify-center rounded-full">
              <HugeiconsIcon icon={ICONS.TOTAL_HOURS} className="text-primary size-5" />
            </div>
            <div>
              <Typography className="text-xs">Total Hours</Typography>
              <Typography variant="caption">
                {userShifts.reduce((acc, shift) => acc + shift.hours, 0)}
              </Typography>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-muted flex size-10 items-center justify-center rounded-full">
              <HugeiconsIcon icon={ICONS.TOTAL_TIPS} className="text-primary size-5" />
            </div>
            <div>
              <Typography className="text-xs">Total Tips</Typography>
              <Typography variant="caption">
                {formatMoney(userShifts.reduce((acc, shift) => acc + shift.tips, 0))}
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily Breakdown</CardTitle>
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

              <UserShiftTable
                dateRange={period}
                userShifts={index === 0 ? firstPeriodShifts : secondPeriodShifts}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
