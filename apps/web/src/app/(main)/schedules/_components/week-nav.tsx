"use client";

import { buttonVariants } from "@serva/ui/components/button";
import { Calendar } from "@serva/ui/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@serva/ui/components/popover";
import { ICONS } from "@/constants/icons";
import { cn } from "@serva/ui/lib/utils";
import { getLocalDateFromUTC } from "@/utils/datetime-client";
import { ChevronRight, Left, Right } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { formatInUTC, type DateRange } from "@serva/shared";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

type WeekNavProps = {
  dateRangeUTC: DateRange;
  prevWeekParam: string; // YYYY-MM-DD
  nextWeekParam: string; // YYYY-MM-DD
  guardedNavigate: (href: string) => void;
};

export function WeekNav({
  dateRangeUTC,
  prevWeekParam,
  nextWeekParam,
  guardedNavigate,
}: WeekNavProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");

  const selectedDateLocal = getLocalDateFromUTC(new Date(dateParam ?? ""));

  const [month, setMonth] = useState(selectedDateLocal);

  function handleCalendarSelect(date: Date | undefined) {
    if (!date) return;
    setCalendarOpen(false);
    guardedNavigate(`/schedules?date=${formatInUTC(date, "yyyy-MM-dd")}`);
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href={`/schedules?date=${prevWeekParam}`}
        className={cn(buttonVariants({ variant: "outline", size: "icon-xs" }))}
      >
        <HugeiconsIcon icon={Left} />
        <span className="sr-only">Previous</span>
      </Link>

      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger id="week-nav-popover-trigger">
          <div className={cn(buttonVariants({ variant: "accent", size: "sm" }), "group w-[200px]")}>
            <span>{formatInUTC(dateRangeUTC.start, "MMM d")}</span>
            <HugeiconsIcon icon={ChevronRight} />
            <span>{formatInUTC(dateRangeUTC.end, "MMM d, yyyy")}</span>
            <HugeiconsIcon
              icon={ICONS.ARROW_DOWN}
              className="text-muted-foreground group-hover:text-foreground ml-1 transition-colors"
            />
          </div>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0">
          <Calendar
            mode="single"
            selected={selectedDateLocal}
            onSelect={handleCalendarSelect}
            month={month}
            onMonthChange={setMonth}
            weekStartsOn={1}
            captionLayout="dropdown"
            startMonth={new Date(2024, 9)}
          />
        </PopoverContent>
      </Popover>

      <Link
        href={`/schedules?date=${nextWeekParam}`}
        className={cn(buttonVariants({ variant: "outline", size: "icon-xs" }))}
      >
        <span className="sr-only">Next</span>
        <HugeiconsIcon icon={Right} />
      </Link>
    </div>
  );
}
