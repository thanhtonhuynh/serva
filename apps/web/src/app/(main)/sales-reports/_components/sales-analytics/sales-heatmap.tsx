"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { HeatmapCell, HeatmapData, WEEKDAY_LABELS, formatMoney } from "@serva/shared";
import { useRouter } from "next/navigation";

type SalesHeatmapProps = {
  data: HeatmapData;
};

const INTENSITY_CLASSES = [
  "bg-neutral-100", // 0 - no sales or no report
  "bg-primary-3", // 1
  "bg-primary-5", // 2
  "bg-primary-7", // 3
  "bg-primary-9", // 4
];

export function SalesHeatmap({ data }: SalesHeatmapProps) {
  const router = useRouter();
  const { cells, months } = data;

  // Calculate how many columns (weeks) we need
  // If the max is 0 (no data), we still want at least 1 week column
  const maxWeekIndex = cells.length > 0 ? Math.max(...cells.map((c) => c.weekIndex)) : 0;
  const totalWeeks = maxWeekIndex + 1;

  // Create a grid: 7 rows (days) x totalWeeks columns
  // Each cell is either a HeatmapCell or null (for dates outside the year)
  // Initialize with nulls
  const grid: (HeatmapCell | null)[][] = Array.from({ length: 7 }, () =>
    Array(totalWeeks).fill(null),
  );

  for (const cell of cells) {
    grid[cell.dayOfWeek][cell.weekIndex] = cell;
  }

  return (
    <div className="overflow-x-auto p-3">
      {/* Month labels */}
      <div className="mb-1 flex">
        {/* Spacer for weekday labels column */}
        <div className="w-6 shrink-0" />
        <div className="flex gap-1">
          {Array.from({ length: totalWeeks }, (_, weekIdx) => {
            // Check if any month starts at this weekIdx
            const month = months.find((m) => m.weekStart === weekIdx);

            if (!month) {
              return <div key={weekIdx} className="w-3" />;
            }
            return (
              <div key={weekIdx} className="w-3 text-xs">
                {month.name}
              </div>
            );
          })}
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="flex">
        {/* Weekday labels */}
        <div className="flex shrink-0 flex-col gap-1 pr-1">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="flex h-3 w-5 items-center justify-end text-[10px]">
              {label}
            </div>
          ))}
        </div>

        {/* Grid of cells */}
        <div className="flex gap-1">
          {Array.from({ length: totalWeeks }, (_, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-1">
              {Array.from({ length: 7 }, (_, dayIdx) => {
                const cell = grid[dayIdx][weekIdx];

                // If no cell (date outside year), render empty
                if (!cell) {
                  return <div key={dayIdx} className="rounded-xs size-3 bg-transparent" />;
                }

                return (
                  <Tooltip key={cell.dateStr}>
                    <TooltipTrigger
                      render={
                        <div
                          className={cn(
                            "rounded-xs size-3 cursor-pointer transition-transform hover:scale-125",
                            INTENSITY_CLASSES[cell.intensity],
                            cell.intensity === 0 && "border",
                          )}
                          onClick={() => {
                            router.push(`/sales-reports?date=${cell.dateStr}`);
                          }}
                        />
                      }
                    />

                    <TooltipContent
                      side="top"
                      sideOffset={8}
                      className="pointer-events-none border shadow-xl"
                    >
                      <p className="font-medium">{cell.formattedDate}</p>
                      {cell.hasReport ? (
                        <p>
                          <span className="text-sm font-medium">
                            {formatMoney(cell.totalSales)}
                          </span>{" "}
                          Total Sales
                        </p>
                      ) : (
                        <p>No report</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
