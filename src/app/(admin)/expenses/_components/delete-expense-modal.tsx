"use client";

import { Typography } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ICONS } from "@/constants/icons";
import { formatInUTC } from "@/utils/datetime";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteExpenseAction } from "../actions";

type Props = {
  expenseId: string;
  date: Date;
};

export function DeleteExpenseModal({ expenseId, date }: Props) {
  const [isPending, startTransition] = useTransition();

  async function handleDeleteExpense() {
    startTransition(async () => {
      const error = await deleteExpenseAction(expenseId);
      if (error) {
        toast.error(error);
      } else {
        toast.success("Expense deleted successfully");
      }
    });
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="accent-destructive"
            size="icon-sm"
            className="text-muted-foreground group-hover:text-destructive"
          >
            <HugeiconsIcon icon={ICONS.DELETE} />
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader showBorder>
          <DialogTitle>Delete expense on {formatInUTC(date, "MMM d, yyyy")}?</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <Typography>
            <div className="font-semibold">Are you sure you want to delete this expense?</div>
            <div>This action cannot be undone.</div>
          </Typography>
        </DialogBody>

        <DialogFooter showCloseButton closeText="Cancel">
          <Button variant="destructive" onClick={handleDeleteExpense} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
