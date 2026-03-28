/** Plain TS equivalent of the Zod-inferred output types used by the data-access layer. */

export type SaleReportOutput = {
  dateStr: string;
  totalSales: number;
  cardSales: number;
  platformSales: { platformId: string; amount: number }[];
  expenses: number;
  expensesReason?: string;
  cardTips: number;
  cashTips: number;
  extraTips: number;
  cashInTill: number;
};

export type WorkShiftInput = {
  startMinutes: number;
  endMinutes: number;
  note?: string | null;
};

export type WorkDayRecordInput = {
  employeeId: string;
  shifts: WorkShiftInput[];
};

export type DayScheduleInput = {
  dateStr: string;
  records: WorkDayRecordInput[];
};

export type ExpensesFormOutput = {
  date: Date;
  entries: { amount: number; reason: string }[];
};
