"use client";

import { SaleReportCard } from "@/app/(main)/sales-reports/_components/sales-report-card";
import { Card } from "@/components/ui/card";
import { useSession } from "@/contexts/SessionProvider";
import { SaleReportInputs } from "@/lib/validations/report";
import { SaleReportCardRawData } from "@/types";
import { parseInUTC } from "@/utils/datetime";
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
    amount: Number(ps.amount) * 100,
  }));

  const rawData: SaleReportCardRawData = {
    date: parseInUTC(formValues.dateStr),
    totalSales: Number(formValues.totalSales) * 100,
    cardSales: Number(formValues.cardSales) * 100,
    platformSales: platformSalesInCents,
    expenses: Number(formValues.expenses) * 100,
    cashInTill: Number(formValues.cashInTill) * 100,
    cardTips: Number(formValues.cardTips) * 100,
    cashTips: Number(formValues.cashTips) * 100,
    extraTips: Number(formValues.extraTips) * 100,
    startCash,
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
