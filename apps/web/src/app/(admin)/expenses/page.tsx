import { FULL_MONTHS, NUM_MONTHS } from "@/app/constants";
import { Callout, CurrentBadge, Typography } from "@serva/ui";
import { Button } from "@serva/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@serva/ui/components/card";
import { ICONS } from "@serva/ui/constants/icons";
import { authGuardWithRateLimit, hasSessionPermission } from "@serva/auth/authorize";
import { populateMonthSelectData } from "@/utils/hours-tips";
import { HugeiconsIcon } from "@hugeicons/react";
import { getExpensesByYear } from "@serva/database";
import {
  PERMISSIONS,
  formatMoney,
  getCurrentMonth,
  getCurrentYear,
  reshapeExpenses,
} from "@serva/shared";
import { notFound, redirect } from "next/navigation";
import { AddExpenseModal, ExpenseRow, YearTotalTable } from "./_components";

type SearchParams = Promise<{
  year?: string;
  month?: string;
}>;

export default async function Page(props: { searchParams: SearchParams }) {
  const { companyCtx } = await authGuardWithRateLimit();
  if (!(await hasSessionPermission(PERMISSIONS.EXPENSES_VIEW))) return notFound();

  const searchParams = await props.searchParams;
  const { years } = await populateMonthSelectData(companyCtx.companyId);

  const currentYear = getCurrentYear();
  const currentMonth = getCurrentMonth();

  if (!searchParams.year) {
    redirect(`/expenses?year=${currentYear}&month=${currentMonth + 1}`);
  }

  const selectedYear = parseInt(searchParams.year);

  if (isNaN(selectedYear) || !years.includes(selectedYear)) {
    return <Callout variant="error" message="Invalid year. Please check the URL and try again." />;
  }

  const selectedMonthParam = searchParams.month;
  const selectedMonth = selectedMonthParam ? parseInt(selectedMonthParam) - 1 : currentMonth;

  if (selectedMonthParam && (isNaN(selectedMonth) || !NUM_MONTHS.includes(selectedMonth + 1))) {
    return <Callout variant="error" message="Invalid month. Please check the URL and try again." />;
  }

  if (!selectedMonthParam) {
    redirect(`/expenses?year=${selectedYear}&month=${selectedMonth + 1}`);
  }

  const expenses = await getExpensesByYear(companyCtx.companyId, selectedYear);
  const monthlyExpenses = reshapeExpenses(expenses);

  const selectedMonthData = monthlyExpenses[selectedMonth];
  const isCurrent = selectedYear === currentYear && selectedMonth === currentMonth;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Year {selectedYear} Summary</CardTitle>
        </CardHeader>

        <CardContent>
          <YearTotalTable monthlyExpenses={monthlyExpenses} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              Expenses in {FULL_MONTHS[selectedMonth]} {selectedYear}
              {isCurrent && <CurrentBadge />}
            </CardTitle>

            <AddExpenseModal defaultDate={new Date(selectedYear, selectedMonth, 1)}>
              <Button variant="outline-accent" size="sm">
                <HugeiconsIcon icon={ICONS.ADD} />
                Add for this period
              </Button>
            </AddExpenseModal>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {selectedMonthData.monthExpenses.length > 0 ? (
            <>
              <div className="space-y-1">
                {selectedMonthData.monthExpenses.map((dayExpense) => (
                  <ExpenseRow key={dayExpense.id} expense={dayExpense} />
                ))}
              </div>

              <Typography
                variant="caption"
                className="bg-accent text-accent-foreground flex items-center justify-between rounded-xl px-6 py-3"
              >
                <span>
                  Total spent in {FULL_MONTHS[selectedMonth]} {selectedYear}
                </span>
                <span>{formatMoney(selectedMonthData.totalExpenses)}</span>
              </Typography>
            </>
          ) : (
            <Typography variant="caption" className="mb-3 text-center font-medium">
              No expenses recorded for {FULL_MONTHS[selectedMonth]} {selectedYear}.
            </Typography>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
