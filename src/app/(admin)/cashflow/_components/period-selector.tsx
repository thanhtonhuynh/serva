"use client";

import { FULL_MONTHS, SHORT_MONTHS } from "@/app/constants";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  selectTriggerVariants,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getTodayStartOfDay } from "@/utils/datetime";
import { ArrowDown01Icon, CalendarCheckInIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type PeriodSelectorProps = {
  years: number[];
};

export function PeriodSelector({ years }: PeriodSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [monthPopoverOpen, setMonthPopoverOpen] = useState(false);

  const today = getTodayStartOfDay();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  // Get selected values from URL or use defaults
  const selectedYear = searchParams.get("year") ? parseInt(searchParams.get("year")!) : currentYear;
  const selectedMonth = searchParams.get("month")
    ? parseInt(searchParams.get("month")!) - 1
    : currentMonth;

  const isYearlyView = pathname.includes("/yearly");

  const updateUrl = (year: number, month?: number) => {
    const params = new URLSearchParams();
    params.set("year", year.toString());
    if (month !== undefined && !isYearlyView) {
      params.set("month", (month + 1).toString());
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleYearChange = (value: string | null) => {
    if (!value) return;
    const year = parseInt(value);
    updateUrl(year, isYearlyView ? undefined : selectedMonth);
  };

  const handleMonthSelect = (monthIndex: number) => {
    updateUrl(selectedYear, monthIndex);
    setMonthPopoverOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Year Selector */}
      <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
        <SelectTrigger className="w-24">
          <SelectValue />
        </SelectTrigger>

        <SelectContent alignItemWithTrigger={false}>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Month Selector - Only show for monthly view */}
      {!isYearlyView && (
        <Popover open={monthPopoverOpen} onOpenChange={setMonthPopoverOpen}>
          <PopoverTrigger className={selectTriggerVariants()}>
            <span>{FULL_MONTHS[selectedMonth]}</span>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              strokeWidth={2}
              className="text-muted-foreground size-4"
            />
          </PopoverTrigger>

          <PopoverContent align="start" className="w-64 p-3">
            <div className="grid grid-cols-3 gap-2">
              {SHORT_MONTHS.map((month, index) => {
                const isSelected = index === selectedMonth;
                const isCurrent = index === currentMonth && selectedYear === currentYear;

                return (
                  <Button
                    key={month}
                    variant={isSelected ? "default" : "accent"}
                    size="sm"
                    className={cn("h-9", isCurrent && !isSelected && "ring-primary/50 ring-1")}
                    onClick={() => handleMonthSelect(index)}
                  >
                    {month}
                  </Button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Current Period Button */}
      {(selectedYear !== currentYear || selectedMonth !== currentMonth) && (
        <Button variant="link" size="sm" onClick={() => updateUrl(currentYear, currentMonth)}>
          <HugeiconsIcon icon={CalendarCheckInIcon} className="size-4" />
          View current
        </Button>
      )}
    </div>
  );
}
