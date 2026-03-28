import { prisma } from "@serva/database";
import { type ExpensesFormOutput } from "@serva/shared";
import "server-only";

export async function createExpenses(data: ExpensesFormOutput, companyId: string) {
  const { date, entries } = data;

  const existingExpense = await prisma.expense.findUnique({
    where: { date, companyId },
  });

  // Convert entries to cents
  const entriesInCents = entries.map((entry) => ({
    ...entry,
    amount: entry.amount * 100,
  }));

  if (existingExpense) {
    const mergedEntries = [...existingExpense.entries, ...entriesInCents];
    await prisma.expense.update({
      where: { id: existingExpense.id },
      data: { entries: mergedEntries },
    });
  } else {
    await prisma.expense.create({
      data: {
        date,
        companyId,
        entries: entriesInCents,
      },
    });
  }
}

export async function updateExpenses(data: ExpensesFormOutput, id: string) {
  const { date, entries } = data;

  await prisma.expense.update({
    where: { id },
    data: {
      date,
      entries: entries.map((entry) => ({
        ...entry,
        amount: entry.amount * 100,
      })),
    },
  });
}

export async function getExpensesByYear(companyId: string, year: number) {
  return prisma.expense.findMany({
    where: {
      companyId,
      date: {
        gte: new Date(Date.UTC(year, 0, 1)),
        lt: new Date(Date.UTC(year + 1, 0, 1)),
      },
    },
  });
}

export async function getExpenseById(id: string) {
  return prisma.expense.findUnique({
    where: { id },
  });
}

export async function deleteExpense(id: string) {
  await prisma.expense.delete({
    where: { id },
  });
}
