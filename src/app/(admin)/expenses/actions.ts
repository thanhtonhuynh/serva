"use server";

import { PERMISSIONS } from "@/constants/permissions";
import { createExpenses, deleteExpense, updateExpenses } from "@/data-access/expenses";
import { authorizeAction, hasSessionPermission } from "@/lib/auth/authorize";
import { ExpensesFormInput, ExpensesFormSchema } from "@/lib/validations/expenses";
import { revalidatePath } from "next/cache";

export async function addExpensesAction(data: ExpensesFormInput): Promise<{ error?: string }> {
  try {
    const authResult = await authorizeAction();
    if ("error" in authResult) return authResult;
    if (!(await hasSessionPermission(PERMISSIONS.EXPENSES_MANAGE)))
      return { error: "Unauthorized" };

    const parsedData = ExpensesFormSchema.parse(data);

    await createExpenses(parsedData);

    revalidatePath("/expenses");

    return {};
  } catch (error) {
    return { error: "Expenses creation failed" };
  }
}

export async function updateExpensesAction(
  data: ExpensesFormInput,
  id: string,
): Promise<{ error?: string }> {
  try {
    const authResult = await authorizeAction();
    if ("error" in authResult) return authResult;
    if (!(await hasSessionPermission(PERMISSIONS.EXPENSES_MANAGE)))
      return { error: "Unauthorized" };

    const parsedData = ExpensesFormSchema.parse(data);

    await updateExpenses(parsedData, id);

    revalidatePath("/expenses");

    return {};
  } catch (error) {
    return { error: "Expense update failed" };
  }
}

export async function deleteExpenseAction(id: string): Promise<{ error?: string }> {
  try {
    const authResult = await authorizeAction();
    if ("error" in authResult) return authResult;
    if (!(await hasSessionPermission(PERMISSIONS.EXPENSES_MANAGE)))
      return { error: "Unauthorized" };

    await deleteExpense(id);

    revalidatePath("/expenses");

    return {};
  } catch (error) {
    return { error: "Expense deletion failed" };
  }
}
