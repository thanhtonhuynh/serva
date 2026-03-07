import { Expense, Permission, Role } from "@prisma/client";

export type EmployeeStatus = "active" | "inactive" | "deactivated";

// Role with permissions
export type RoleWithPermissions = Role & { permissions: Permission[] };

// Basic user type for display purposes (without permissionContext)
export type DisplayUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  emailVerified: boolean;
  accountStatus: string;
  image: string | null;
  hiddenFromReports: boolean;
  createdAt: Date;
  updatedAt: Date;
  role: {
    id: string;
    name: string;
    permissions: { code: string }[];
  } | null;
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

export type SaleEmployee = {
  userId: string;
  hour: number;
  name?: string;
  image?: string;
  username?: string;
};

export type ReportAuditLog = {
  userId: string;
  timestamp: Date;
  name?: string;
  image?: string | null;
  username?: string;
};

export interface SaleReportCardRawData {
  id?: string;
  date: Date;
  reporterName: string;
  reporterImage: string | null;
  reporterUsername: string;
  totalSales: number;
  cardSales: number;
  expenses: number;
  expensesReason?: string | null;
  cardTips: number;
  cashTips: number;
  extraTips: number;
  cashInTill: number;
  startCash: number;
  // Legacy platform fields (kept for backward compat)
  // uberEatsSales: number;
  // doorDashSales: number;
  // skipTheDishesSales: number;
  // onlineSales: number; // Actually Ritual sales
  // New flexible platform sales
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

export type DayRange = {
  start: Date;
  end: Date;
};

export type TotalHoursTips = {
  userId: string;
  name: string;
  username: string;
  image: string;
  totalHours: number;
  totalTips: number;
};

export type EmployeeShift = {
  userId: string;
  date: Date;
  hours: number;
  tips: number;
  user: {
    name: string;
    image: string | null;
  };
};

export type BreakdownData = {
  userId: string;
  userName: string;
  userUsername: string;
  image: string;
  keyData: number[];
  total: number;
};

export type Shift = {
  userId: string;
  userName: string;
  userUsername: string;
  userImage: string;
  date: Date;
  hours: number;
  tips: number;
};

export type CashFlowRawData = {
  id: string;
  date: Date;
  totalSales: number;
  cardSales: number;
  // // Legacy platform fields (kept for backward compat)
  // uberEatsSales: number;
  // doorDashSales: number;
  // skipTheDishesSales: number;
  // onlineSales: number; // Actually Ritual sales
  // New flexible platform sales
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
