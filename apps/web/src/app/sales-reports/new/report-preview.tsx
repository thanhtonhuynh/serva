"use client";

import { SaleReportCard } from "@/app/sales-reports/_components/sales-report-card";
import { useSession } from "@/contexts/SessionProvider";
import { SaleReportInputs } from "@/lib/validations/report";
import { Card } from "@serva/serva-ui";
import { SaleReportCardRawData, parseInUTC, processReportDataForView } from "@serva/shared";
import { use } from "react";
import { UseFormReturn } from "react-hook-form";

type Props = {
  saleReportForm: UseFormReturn<SaleReportInputs>;
  startCashPromise: Promise<number>;
  reporterName?: string;
  reporterImage?: string | null;
};

export function ReportPreview({
  saleReportForm,
  startCashPromise,
  reporterName,
  reporterImage,
}: Props) {
  const { identity } = useSession();
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
    reporterName: reporterName ?? identity?.name ?? "Unknown user",
    reporterImage: reporterImage ?? identity?.image ?? null,
  };

  const processedData = processReportDataForView(rawData);

  return (
    <Card className="p-3">
      <SaleReportCard data={processedData} />
    </Card>
  );
}
