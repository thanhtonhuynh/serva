import { Expense } from "@serva/database";

export type EmployeeStatus = "active" | "awaiting" | "deactivated";

/** Display type for an operator record (with nested identity). */
export type DisplayOperator = {
  id: string;
  identityId: string;
  companyId: string;
  status: string;
  role: {
    id: string;
    name: string;
    permissions: { code: string }[];
  } | null;
  identity: { name: string; email: string; image: string | null };
};

/** Display type for an employee record (with nested identity). */
export type DisplayEmployee = {
  id: string;
  identityId: string;
  companyId: string;
  status: string;
  /** Kitchen/service job title (Chef, Server). Not RBAC. */
  job: { id: string; name: string } | null;
  locationId?: string | null;
  departmentId?: string | null;
  identity: { name: string; email: string; image: string | null };
};

export type CashType =
  | "coin5c"
  | "coin10c"
  | "coin25c"
  | "coin1"
  | "coin2"
  | "bill5"
  | "bill10"
  | "bill20"
  | "bill50"
  | "bill100"
  | "roll5c"
  | "roll10c"
  | "roll25c"
  | "roll1"
  | "roll2";

/** A single platform's sales amount (stored in cents in DB) */
export type PlatformSaleData = {
  platformId: string;
  amount: number;
};

export type ReportAuditLog = {
  identityId: string;
  timestamp: Date;
  name?: string;
  image?: string | null;
};

export interface SaleReportCardRawData {
  id?: string;
  date: Date;
  reporterName: string;
  reporterImage: string | null;
  totalSales: number;
  cardSales: number;
  expenses: number;
  expensesReason?: string | null;
  cardTips: number;
  cashTips: number;
  extraTips: number;
  cashInTill: number;
  startCash: number;
  platformSales: PlatformSaleData[];
  // employees: SaleEmployee[];
  auditLogs?: ReportAuditLog[];
}

export interface SaleReportCardProcessedData extends SaleReportCardRawData {
  inStoreSales: number;
  onlineSales: number;
  cashSales: number;
  actualCash: number;
  totalTips: number;
  cashDifference: number;
  cashOut: number;
  // totalHours: number;
  // tipsPerHour: number;
}

export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type ShiftHours = {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
};

/** @deprecated Use DateRange instead */
export type DayRange = {
  start: Date;
  end: Date;
};

export type TotalHoursTips = {
  employeeId: string;
  name: string;
  image: string;
  totalHours: number;
  totalTips: number;
};

export type BreakdownData = {
  employeeId: string;
  name: string;
  image: string;
  keyData: number[];
  total: number;
};

// export type Shift = {
//   userId: string;
//   userName: string;
//   userUsername: string;
//   userImage: string;
//   date: Date;
//   hours: number;
//   tips: number;
// };

export type CashFlowRawData = {
  id: string;
  date: Date;
  totalSales: number;
  cardSales: number;
  platformSales: PlatformSaleData[];
  expenses: number;
};

export type CashFlowData = CashFlowRawData & {
  actualCash: number;
  totalRevenue: number;
};

export type UserShift = {
  // id: string;
  date: Date;
  hours: number;
  tips: number;
};

export type YearCashFlowData = {
  month: number;
  totalSales: number;
  /** Dynamic platform totals: platformId → total amount in cents */
  platformTotals: Record<string, number>;
  totalInStoreSales: number;
  totalInstoreExpenses: number;
  netIncome: number;
  totalMonthMainExpenses: number;
  totalExpenses: number;
};

export type MonthlyExpense = {
  month: number;
  monthExpenses: Expense[];
  totalExpenses: number;
};
