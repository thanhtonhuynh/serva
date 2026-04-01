import { UserShiftTable } from "@/app/(main)/my-shifts/_components";
import { Typography } from "@serva/serva-ui";
import { Button } from "@serva/serva-ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@serva/serva-ui/components/card";
import { Separator } from "@serva/serva-ui/components/separator";
import { ICONS } from "@serva/serva-ui/constants/icons";
import { getWorkDayRecordsByEmployeeAndDateRange } from "@serva/database/dal";
import { HugeiconsIcon } from "@hugeicons/react";
import { formatInUTC, getCurrentBiweeklyPeriodInUTC, formatMoney } from "@serva/shared";
import Link from "next/link";

type Props = {
  employeeId: string;
};

export async function CurrentPayPeriodSummary({ employeeId }: Props) {
  const todayBiweeklyPeriod = getCurrentBiweeklyPeriodInUTC();
  const workDayRecords = await getWorkDayRecordsByEmployeeAndDateRange(
    employeeId,
    todayBiweeklyPeriod,
  );

  const userShifts = workDayRecords.map((r) => ({
    date: r.date,
    hours: r.totalHours,
    tips: r.tips,
  }));

  return (
    <Card>
      <CardHeader className="flex flex-col gap-6">
        <CardTitle>Current Pay Period</CardTitle>
        <Typography variant="h3" className="flex items-center gap-2">
          <HugeiconsIcon icon={ICONS.CALENDAR} className="size-4" strokeWidth={2} />
          <span>{formatInUTC(todayBiweeklyPeriod.start, "MMM d")}</span>
          <HugeiconsIcon icon={ICONS.ARROW_RIGHT} className="size-3" />
          <span>{formatInUTC(todayBiweeklyPeriod.end, "d")}</span>
        </Typography>
      </CardHeader>

      <CardContent className="flex flex-col space-y-6">
        <div className="space-y-3">
          <Typography variant="h3">Summary</Typography>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="bg-muted flex size-10 items-center justify-center rounded-full">
                <HugeiconsIcon
                  icon={ICONS.TOTAL_HOURS}
                  className="text-primary size-5"
                  strokeWidth={1.5}
                />
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
                <HugeiconsIcon
                  icon={ICONS.TOTAL_TIPS}
                  className="text-primary size-5"
                  strokeWidth={1.5}
                />
              </div>
              <div>
                <Typography className="text-xs">Total Tips</Typography>
                <Typography variant="caption">
                  {formatMoney(userShifts.reduce((acc, shift) => acc + shift.tips, 0))}
                </Typography>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <Typography variant="h3">Daily Breakdown</Typography>
          <UserShiftTable dateRange={todayBiweeklyPeriod} userShifts={userShifts} />
        </div>

        <Button
          nativeButton={false}
          variant="link"
          size="sm"
          className="-mt-3 self-end"
          render={
            <Link href="/my-shifts">
              View more
              <HugeiconsIcon icon={ICONS.ARROW_RIGHT} />
            </Link>
          }
        />
      </CardContent>
    </Card>
  );
}
