"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { formatMoney } from "@/lib/utils";
import {
  calculateSalesAnalytics,
  DaySalesData,
  generateHeatmapData,
  SalesAnalytics,
} from "@/utils/sales-analytics";
import { useCallback, useMemo, useState } from "react";
import { SalesHeatmap } from "./sales-heatmap";
import { SalesStats } from "./sales-stats";

type SalesAnalyticsDashboardProps = {
  reportsByYear: Record<number, DaySalesData[]>;
  availableYears: number[];
  currentYear: number;
};

export function SalesAnalyticsDashboardClient({
  reportsByYear,
  availableYears,
  currentYear,
}: SalesAnalyticsDashboardProps) {
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const reports = useMemo(() => reportsByYear[selectedYear] ?? [], [reportsByYear, selectedYear]);

  const heatmapData = useMemo(
    () => generateHeatmapData(selectedYear, reports),
    [selectedYear, reports],
  );

  const analytics: SalesAnalytics = useMemo(() => calculateSalesAnalytics(reports), [reports]);

  const handleYearChange = useCallback((value: string | null) => {
    if (value) {
      setSelectedYear(parseInt(value, 10));
    }
  }, []);

  return (
    <Card className="">
      {/* Header row: Total Sales + Year Selector */}
      <CardHeader className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium">Total Sales</p>
          <p className="text-primary text-3xl font-bold tracking-tight">
            {formatMoney(analytics.ytdTotalSales)}
          </p>
        </div>
        <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
          <SelectTrigger variant="outline" className="w-25">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            {availableYears.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Heatmap */}
        <div className="mx-auto max-w-fit">
          <SalesHeatmap data={heatmapData} />
        </div>

        <Separator />

        {/* Stats row */}
        <SalesStats analytics={analytics} />

        {/* Legend */}
        <div className="text-muted-foreground mt-4 flex items-center gap-2 text-xs">
          <span>Fewer</span>
          <div className="flex gap-1">
            <span className="size-3 rounded-xs border bg-neutral-100" />
            <span className="bg-primary-3 size-3 rounded-xs" />
            <span className="bg-primary-5 size-3 rounded-xs" />
            <span className="bg-primary-7 size-3 rounded-xs" />
            <span className="bg-primary-9 size-3 rounded-xs" />
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
