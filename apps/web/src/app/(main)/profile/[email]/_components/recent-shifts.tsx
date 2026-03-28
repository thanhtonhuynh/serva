import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkSquare01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { formatInUTC, formatMoney } from "@serva/shared";
import Link from "next/link";

type RecentShift = {
  date: Date;
  hours: number;
  tips: number;
};

type RecentShiftsProps = {
  shifts: RecentShift[];
  isOwner: boolean;
};

export function RecentShifts({ shifts, isOwner }: RecentShiftsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Shifts</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {shifts.length === 0 && (
          <p className="text-muted-foreground text-sm">
            {isOwner ? "You don't have any recorded shifts yet." : "No shifts recorded yet."}
          </p>
        )}

        {shifts.length > 0 &&
          shifts.map((shift) => (
            <Link
              key={shift.date.toISOString()}
              href={`/report?date=${formatInUTC(shift.date)}`}
              className="hover:bg-muted/50 group flex items-center justify-between rounded-lg border p-3 text-sm transition-colors"
            >
              <p>{formatInUTC(shift.date, "EEEE, MMM d, yyyy")}</p>

              <div className="flex items-center gap-3">
                <div className="mr-2 text-right">
                  <p className="font-medium">{shift.hours}</p>
                  <p className="text-muted-foreground text-xs">Hours</p>
                </div>

                <div className="text-right">
                  <p className="font-medium">{formatMoney(shift.tips)}</p>
                  <p className="text-muted-foreground text-xs">Tips</p>
                </div>

                <HugeiconsIcon
                  icon={LinkSquare01Icon}
                  className="text-muted-foreground hidden size-4 opacity-0 transition-opacity group-hover:opacity-100 sm:block"
                />
              </div>
            </Link>
          ))}
      </CardContent>
    </Card>
  );
}
