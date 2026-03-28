"use client";

import { DecoIcon, Typography } from "@/components/shared";
import { ProfilePicture } from "@/components/shared/profile-picture";
import { Separator } from "@serva/ui/components/separator";
import { ICONS } from "@/constants/icons";
import { cn } from "@serva/ui/lib/utils";
import {
  formatInUTC,
  getPlatformAmount,
  getPlatformById,
  SaleReportCardProcessedData,
  formatMoney,
  type Platform,
} from "@serva/shared";

type Props = {
  data: SaleReportCardProcessedData | undefined;
};

export function SaleReportCard({ data }: Props) {
  if (!data) {
    return null;
  }

  const platformData: Platform[] = data.platformSales
    .map((ps) => getPlatformById(ps.platformId))
    .filter(Boolean) as Platform[];

  return (
    <div className="space-y-6 text-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DecoIcon icon={ICONS.CALENDAR} showBackground />
          <div>
            <Typography variant="p-xs">Report Date</Typography>
            <Typography variant="caption">{formatInUTC(data.date, "EEEE, MMM d, yyyy")}</Typography>
          </div>
        </div>

        <div
          // href={`/profile/${data.reporterUsername}`}
          className="group flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <ProfilePicture image={data.reporterImage} size={36} name={data.reporterName} />
          <div>
            <Typography variant="p-xs">Reported by</Typography>
            <Typography variant="caption" className="group-hover:underline">
              {data.reporterName}
            </Typography>
          </div>
        </div>
      </div>

      {/* Sales Section */}
      <div className="bg-accent/30 space-y-3 rounded-xl border p-3">
        <Typography variant="h3">Sales</Typography>

        {/* Total Sales */}
        <div className="flex items-center gap-3">
          <DecoIcon icon={ICONS.SALES_TOTAL} showBackground />
          <div>
            <Typography variant="p-xs">Total Sales</Typography>
            <Typography variant="caption">{formatMoney(data.totalSales)}</Typography>
          </div>
        </div>

        {/* In-store & Online breakdown */}
        <div className="grid gap-3 border-t pt-3 sm:grid-cols-2 sm:gap-6">
          {/* In-store Sales */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <DecoIcon icon={ICONS.SALES_IN_STORE} showBackground />
              <div>
                <Typography variant="p-xs">In-store Sales</Typography>
                <Typography variant="caption">{formatMoney(data.inStoreSales)}</Typography>
              </div>
            </div>

            <div className="ml-12">
              <Typography variant="p-xs" className="flex items-center justify-between">
                <span>Card</span>
                <span>{formatMoney(data.cardSales)}</span>
              </Typography>
              <Typography variant="p-xs" className="flex items-center justify-between">
                <span>Cash</span>
                <span>{formatMoney(data.cashSales)}</span>
              </Typography>
            </div>
          </div>

          {/* Online Sales */}
          <div className="space-y-3 border-t pt-3 sm:border-t-0 sm:pt-0">
            <div className="flex items-center gap-3">
              <DecoIcon icon={ICONS.SALES_ONLINE} showBackground />
              <div>
                <Typography variant="p-xs">Online Sales</Typography>
                <Typography variant="caption">{formatMoney(data.onlineSales)}</Typography>
              </div>
            </div>

            <div className="ml-12">
              {platformData.map((platform) => (
                <Typography
                  key={platform.id}
                  variant="p-xs"
                  className="flex items-center justify-between"
                >
                  <span>{platform.label}</span>
                  <span>{formatMoney(getPlatformAmount(data.platformSales, platform.id))}</span>
                </Typography>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cash Section */}
      <div className="bg-accent/30 space-y-3 rounded-xl border p-3">
        <Typography variant="h3">Cash</Typography>

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-6">
          {/* Cash Out */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <DecoIcon icon={ICONS.CASH_OUT} showBackground />
              <div>
                <Typography variant="p-xs">Cash Out</Typography>
                <Typography variant="caption">{formatMoney(data.cashOut)}</Typography>
              </div>
            </div>

            <div className="ml-12">
              <Typography variant="p-xs" className="flex items-center justify-between">
                <span>From Till</span>
                <span>{formatMoney(data.cashInTill - data.startCash)}</span>
              </Typography>
              <Typography variant="p-xs" className="flex items-center justify-between">
                <span>Cash Tips</span>
                <span>{formatMoney(data.cashTips)}</span>
              </Typography>
            </div>
          </div>

          {/* Cash Difference */}
          <div className="space-y-3 border-t pt-3 sm:border-t-0 sm:pt-0">
            <div className="flex items-center gap-3">
              <DecoIcon
                icon={ICONS.CASH_DIFFERENCE}
                showBackground
                iconClassName={cn(
                  data.cashDifference < 0 && "text-destructive",
                  data.cashDifference > 0 && "text-success",
                )}
              />
              <div>
                <Typography variant="p-xs">Cash Difference</Typography>
                <Typography
                  variant="caption"
                  className={cn(
                    data.cashDifference < 0 && "text-destructive",
                    data.cashDifference > 0 && "text-success",
                  )}
                >
                  {formatMoney(data.cashDifference)}
                </Typography>
              </div>
            </div>

            <div className="ml-12">
              <Typography variant="p-xs" className="flex items-center justify-between">
                <span>Cash in Till</span>
                <span>{formatMoney(data.cashInTill)}</span>
              </Typography>
              <Typography variant="p-xs" className="flex items-center justify-between">
                <span>Start Cash</span>
                <span>{formatMoney(data.startCash)}</span>
              </Typography>
              <Typography variant="p-xs" className="flex items-center justify-between">
                <span>Actual Cash</span>
                <span>{formatMoney(data.actualCash)}</span>
              </Typography>
            </div>
          </div>
        </div>

        <Separator />

        {/* Expenses */}
        {data.expenses > 0 && (
          <div className="flex items-center gap-3">
            <DecoIcon icon={ICONS.EXPENSE} showBackground />
            <div className="flex-1">
              <Typography variant="p-xs">Expenses</Typography>
              <Typography variant="caption" className="flex items-center justify-between">
                <span>{formatMoney(data.expenses)}</span>
                {data.expensesReason && (
                  <span className="text-xs font-normal"> {data.expensesReason}</span>
                )}
              </Typography>
            </div>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="bg-accent/30 space-y-3 rounded-xl border p-3">
        <Typography variant="h3">Tips</Typography>

        {/* Main stats with separator */}
        <div className="grid gap-3 sm:grid-cols-3 sm:items-start sm:gap-6">
          {/* Total Tips with breakdown */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <DecoIcon icon={ICONS.TOTAL_TIPS} showBackground />
              <div>
                <Typography variant="p-xs">Total Tips</Typography>
                <Typography variant="caption">{formatMoney(data.totalTips)}</Typography>
              </div>
            </div>

            <div className="ml-12">
              <Typography variant="p-xs" className="flex items-center justify-between">
                <span>Card</span>
                <span>{formatMoney(data.cardTips)}</span>
              </Typography>
              <Typography variant="p-xs" className="flex items-center justify-between">
                <span>Cash</span>
                <span>{formatMoney(data.cashTips)}</span>
              </Typography>
              <Typography variant="p-xs" className="flex items-center justify-between">
                <span>Extra</span>
                <span>{formatMoney(data.extraTips)}</span>
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
