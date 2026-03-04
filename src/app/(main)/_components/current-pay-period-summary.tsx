import { UserShiftTable } from "@/app/(main)/my-shifts/_components";
import { Typography } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ICONS } from "@/constants/icons";
import { getUserShiftsInDateRange } from "@/data-access/employee";
import { User } from "@/lib/auth/session";
import { formatMoney } from "@/lib/utils";
import { getTodayBiweeklyPeriod } from "@/utils/hours-tips";
import { HugeiconsIcon } from "@hugeicons/react";
import { format } from "date-fns";
import Link from "next/link";

type Props = {
  user: User;
};

export async function CurrentPayPeriodSummary({ user }: Props) {
  const todayBiweeklyPeriod = getTodayBiweeklyPeriod();
  const userShifts = await getUserShiftsInDateRange(user.id, todayBiweeklyPeriod);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-6">
        <CardTitle>Current Pay Period</CardTitle>
        <Typography variant="h3" className="flex items-center gap-2">
          <HugeiconsIcon icon={ICONS.CALENDAR} className="size-4" strokeWidth={2} />
          <span>{format(todayBiweeklyPeriod.start, "MMM d")}</span>
          <HugeiconsIcon icon={ICONS.ARROW_RIGHT} className="size-3" />
          <span>{format(todayBiweeklyPeriod.end, "MMM d")}</span>
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
