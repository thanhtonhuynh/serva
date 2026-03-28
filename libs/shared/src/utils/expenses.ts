import { Expense } from "@serva/database";
import { MonthlyExpense } from "@serva/shared";

export function reshapeExpenses(expenses: Expense[]): MonthlyExpense[] {
  const data = Array(12)
    .fill(null)
    .map((_, month) => {
      const monthExpenses = expenses
        .filter((expense) => expense.date.getUTCMonth() === month)
        .sort((a, b) => a.date.getUTCDate() - b.date.getUTCDate());
      const entries = monthExpenses.flatMap((expense) => expense.entries);
      const totalExpenses = entries.reduce((acc, entry) => acc + entry.amount, 0);

      return {
        month,
        monthExpenses,
        totalExpenses,
      };
    });

  return data;
}
