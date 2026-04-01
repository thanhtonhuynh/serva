"use server";

import { authorizeAction, hasSessionPermission } from "@serva/auth/authorize";
import { ExpensesFormInput, ExpensesFormSchema } from "@/lib/validations/expenses";
import { createExpenses, deleteExpense, updateExpenses } from "@serva/database/dal";
import { PERMISSIONS } from "@serva/shared";
import { revalidatePath } from "next/cache";

export async function addExpensesAction(data: ExpensesFormInput): Promise<{ error?: string }> {
  try {
    const authResult = await authorizeAction();
    if ("error" in authResult) return authResult;
    if (!(await hasSessionPermission(PERMISSIONS.EXPENSES_MANAGE)))
      return { error: "Unauthorized" };

    const parsedData = ExpensesFormSchema.parse(data);
    const { companyCtx } = authResult;

    await createExpenses(parsedData, companyCtx.companyId);

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
