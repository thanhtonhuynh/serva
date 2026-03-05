import { FULL_MONTHS, NUM_MONTHS } from "@/app/constants";
import { CurrentBadge, Typography } from "@/components/shared";
import { NotiMessage } from "@/components/shared/noti-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ICONS } from "@/constants/icons";
import { PERMISSIONS } from "@/constants/permissions";
import { getExpensesByYear } from "@/data-access/expenses";
import { getCurrentSession } from "@/lib/auth/session";
import { formatMoney } from "@/lib/utils";
import { hasPermission } from "@/utils/access-control";
import { getCurrentMonth, getCurrentYear } from "@/utils/datetime";
import { reshapeExpenses } from "@/utils/expenses";
import { populateMonthSelectData } from "@/utils/hours-tips";
import { authenticatedRateLimit } from "@/utils/rate-limiter";
import { HugeiconsIcon } from "@hugeicons/react";
import { notFound, redirect } from "next/navigation";
import { AddExpenseModal, ExpenseRow, YearTotalTable } from "./_components";

type SearchParams = Promise<{
  year?: string;
  month?: string;
}>;

export default async function Page(props: { searchParams: SearchParams }) {
  const { session, user } = await getCurrentSession();
  if (!session) redirect("/login");
  if (user.accountStatus !== "active") return notFound();
  if (!hasPermission(user.role, PERMISSIONS.EXPENSES_VIEW)) return notFound();

  if (!(await authenticatedRateLimit(user.id))) {
    return <NotiMessage variant="error" message="Too many requests. Please try again later." />;
  }

  const searchParams = await props.searchParams;
  const { years } = await populateMonthSelectData();

  const currentYear = getCurrentYear();
  const currentMonth = getCurrentMonth();

  if (!searchParams.year) {
    redirect(`/expenses?year=${currentYear}&month=${currentMonth + 1}`);
  }

  const selectedYear = parseInt(searchParams.year);

  if (isNaN(selectedYear) || !years.includes(selectedYear)) {
    return (
      <NotiMessage variant="error" message="Invalid year. Please check the URL and try again." />
    );
  }

  const selectedMonthParam = searchParams.month;
  const selectedMonth = selectedMonthParam ? parseInt(selectedMonthParam) - 1 : currentMonth;

  if (selectedMonthParam && (isNaN(selectedMonth) || !NUM_MONTHS.includes(selectedMonth + 1))) {
    return (
      <NotiMessage variant="error" message="Invalid month. Please check the URL and try again." />
    );
  }

  if (!selectedMonthParam) {
    redirect(`/expenses?year=${selectedYear}&month=${selectedMonth + 1}`);
  }

  const expenses = await getExpensesByYear(selectedYear);
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
