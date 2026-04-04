"use client";

import { Typography } from "@serva/serva-ui";
import { Button } from "@serva/serva-ui";
import { Separator } from "@serva/serva-ui";
import { ICONS } from "@serva/serva-ui";
import { HugeiconsIcon } from "@hugeicons/react";
import { Expense } from "@serva/database";
import { formatMoney } from "@serva/shared";
import { useState } from "react";
import { DeleteExpenseModal } from "./delete-expense-modal";
import { EditExpenseModal } from "./edit-expense-modal";

type Props = {
  expense: Expense;
};

export function ExpenseRow({ expense }: Props) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <div className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 transition-all duration-300 hover:border-blue-200">
        <Typography variant="h3" className="w-4">
          {expense.date.getUTCDate()}
        </Typography>

        <Typography className="flex-1 text-xs">
          {expense.entries.map((entry, index) => (
            <div key={index} className="flex justify-between gap-3">
              <span className="line-clamp-1">{entry.reason}</span>
              <span className="font-medium">{formatMoney(entry.amount)}</span>
            </div>
          ))}
        </Typography>

        <div className="flex items-center self-center">
          <Button
            variant="accent"
            size="icon-sm"
            className="text-muted-foreground group-hover:text-primary hover:text-primary"
            onClick={() => setEditOpen(true)}
          >
            <HugeiconsIcon icon={ICONS.EDIT} />
          </Button>

          <DeleteExpenseModal expenseId={expense.id} date={expense.date} />
        </div>
      </div>

      <Separator />

      <EditExpenseModal expense={expense} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
