"use client";

import { Typography } from "@serva/ui";
import { Button } from "@serva/ui/components/button";
import { Calendar } from "@serva/ui/components/calendar";
import { Card } from "@serva/ui/components/card";
import { getLocalDateFromUTC } from "@/utils/datetime-client";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function ReportPicker() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dateParam = searchParams.get("date");

  const today = new Date();
  const selectedDateLocal = dateParam ? getLocalDateFromUTC(new Date(dateParam)) : today;

  const [month, setMonth] = useState<Date>(selectedDateLocal);

  useEffect(() => {
    setMonth(dateParam ? getLocalDateFromUTC(new Date(dateParam)) : today);
  }, [dateParam]);

  function handleCalendarSelect(date: Date | undefined) {
    if (!date) return;
    router.push(`/sales-reports?date=${format(date, "yyyy-MM-dd")}`);
  }

  return (
    <Card className="min-w-sm p-6">
      <Typography variant="h2">Select a date to view a sales report</Typography>

      <div className="flex flex-col gap-3">
        <Calendar
          mode="single"
          selected={selectedDateLocal}
          onSelect={handleCalendarSelect}
          month={month}
          onMonthChange={setMonth}
          startMonth={new Date(2024, 9)}
          weekStartsOn={1}
          captionLayout="dropdown"
          className="w-full"
        />

        <Button
          variant="link"
          size={"sm"}
          onClick={() => {
            router.push(`/sales-reports?date=${format(new Date(), "yyyy-MM-dd")}`);
          }}
        >
          View Today
        </Button>
      </div>
    </Card>
  );
}
