"use client";

import { SaleReportCard } from "@/app/(main)/sales-reports/_components/sales-report-card";
import { Card } from "@/components/ui/card";
import { useSession } from "@/contexts/SessionProvider";
import { SaleReportInputs } from "@/lib/validations/report";
import { SaleReportCardRawData } from "@/types";
import { processReportDataForView } from "@/utils/report";
import { use } from "react";
import { UseFormReturn } from "react-hook-form";

type Props = {
  saleReportForm: UseFormReturn<SaleReportInputs>;
  startCashPromise: Promise<number>;
  reporterName?: string;
  reporterImage?: string | null;
  reporterUsername?: string;
};

export function ReportPreview({
  saleReportForm,
  startCashPromise,
  reporterName,
  reporterImage,
  reporterUsername,
}: Props) {
  const { user } = useSession();
  const startCash = use(startCashPromise);
  const formValues = saleReportForm.watch();

  // Convert platformSales amounts to cents for preview
  const platformSalesInCents = (formValues.platformSales ?? []).map((ps) => ({
    platformId: ps.platformId,
    amount: ps.amount * 100,
  }));

  const rawData: SaleReportCardRawData = {
    date: formValues.date,
    totalSales: formValues.totalSales * 100,
    cardSales: formValues.cardSales * 100,
    // Legacy fields set to 0 — platformSales is the source of truth
    // uberEatsSales: 0,
    // doorDashSales: 0,
    // skipTheDishesSales: 0,
    // onlineSales: 0,
    platformSales: platformSalesInCents,
    expenses: formValues.expenses * 100,
    cashInTill: formValues.cashInTill * 100,
    cardTips: formValues.cardTips * 100,
    cashTips: formValues.cashTips * 100,
    extraTips: formValues.extraTips * 100,
    startCash,
    // employees: [],
    reporterName: reporterName ?? user?.name ?? "Unknown user",
    reporterImage: reporterImage ?? user?.image ?? null,
    reporterUsername: reporterUsername ?? user?.username ?? "unknown",
  };

  const processedData = processReportDataForView(rawData);

  return (
    <Card className="p-3">
      <SaleReportCard data={processedData} />
    </Card>
  );
}
