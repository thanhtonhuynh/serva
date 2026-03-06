import prisma from "@/lib/prisma";
import { ExpensesFormInput } from "@/lib/validations/expenses";
import "server-only";

export async function createExpenses(data: ExpensesFormInput) {
  const { date, entries } = data;

  const existingExpense = await prisma.expense.findUnique({
    where: { date },
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
      data: {
        entries: mergedEntries,
      },
    });
  } else {
    await prisma.expense.create({
      data: {
        date,
        entries: entriesInCents,
      },
    });
  }
}

export async function updateExpenses(data: ExpensesFormInput, id: string) {
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

export async function getExpensesByYear(year: number) {
  return prisma.expense.findMany({
    where: {
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
