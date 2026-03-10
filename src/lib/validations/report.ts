import { z } from "zod";

const trimmedString = z.string().trim();
const requiredString = trimmedString.min(1, "Required");

/** Schema for a single platform sale entry */
export const PlatformSaleSchema = z.object({
  platformId: requiredString,
  amount: z.coerce.number().gte(0, { error: "Invalid" }).default(0),
});

// Create report
export const SaleReportSchema = z.object({
  date: z.date({ error: "Invalid date" }),
  totalSales: z.coerce.number().gte(0, { error: "Invalid" }).default(0),
  cardSales: z.coerce.number().gte(0, { error: "Invalid" }).default(0),
  platformSales: z.array(PlatformSaleSchema).default([]),
  expenses: z.coerce.number().gte(0, { error: "Invalid" }).default(0),
  expensesReason: trimmedString.toLowerCase().optional(),
  cardTips: z.coerce.number().gte(0, { error: "Invalid" }).default(0),
  cashTips: z.coerce.number().gte(0, { error: "Invalid" }).default(0),
  extraTips: z.coerce.number().gte(0, { error: "Invalid" }).default(0),
  cashInTill: z.coerce.number().gte(0, { error: "Invalid" }).default(0),
});
export type SaleReportInputs = z.input<typeof SaleReportSchema>;
export type SaleReportOutput = z.output<typeof SaleReportSchema>;
