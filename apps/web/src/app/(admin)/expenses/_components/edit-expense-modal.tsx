"use client";

import { LoadingButton } from "@/components/buttons/LoadingButton";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { InputField } from "@/components/ui/form/input-field";
import { ICONS } from "@/constants/icons";
import { cn } from "@/lib/utils";
import { ExpensesFormInput, ExpensesFormSchema } from "@/lib/validations/expenses";
import { getLocalDateFromUTC, getUTCMidnightFromLocal } from "@/utils/datetime-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { HugeiconsIcon } from "@hugeicons/react";
import { Expense } from "@prisma/client";
import { useEffect, useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateExpensesAction } from "../actions";

type Props = {
  expense: Expense;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditExpenseModal({ expense, open, onOpenChange }: Props) {
  // Convert expense date to local date for calendar display
  const expenseDate = getLocalDateFromUTC(expense.date);

  const [month, setMonth] = useState<Date>(expenseDate);

  const form = useForm<ExpensesFormInput>({
    mode: "onChange",
    resolver: zodResolver(ExpensesFormSchema),
    defaultValues: {
      date: expenseDate,
      entries: expense.entries.map((entry) => ({
        ...entry,
        amount: entry.amount / 100,
      })),
    },
  });

  const entries = useFieldArray({ control: form.control, name: "entries" });
  const [isPending, startTransition] = useTransition();
  const { isDirty, isValid } = form.formState;

  // Reset form when expense changes or dialog opens
  // This is needed because when expense is updated, we need to reset the values.
  useEffect(() => {
    if (open) {
      const date = getLocalDateFromUTC(expense.date);
      form.reset({
        date,
        entries: expense.entries.map((entry) => ({
          ...entry,
          amount: entry.amount / 100,
        })),
      });
      setMonth(date);
    }
  }, [expense, open, form]);

  async function onSubmit(data: ExpensesFormInput) {
    // Normalize date to UTC midnight before submitting
    data.date = getUTCMidnightFromLocal(data.date);

    startTransition(async () => {
      const { error } = await updateExpensesAction(data, expense.id);

      if (error) {
        toast.error(error);
      } else {
        toast.success("Expense updated successfully");
        onOpenChange(false);
      }
    });
  }

  return (
    <Dialog disablePointerDismissal open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader showBorder>
          <DialogTitle>Edit expense</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        onDayClick={field.onChange}
                        month={month}
                        onMonthChange={setMonth}
                        startMonth={new Date(2024, 9)}
                        captionLayout="dropdown"
                        className="rounded-lg border border-blue-950"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <FormLabel>Entries</FormLabel>
                {entries.fields.map((entry, index) => (
                  <div key={entry.id} className="flex items-start gap-2">
                    <InputField
                      nameInSchema={`entries.${index}.amount`}
                      fieldTitle={index === 0 ? "Amount" : ""}
                      type="number"
                      labelClassName="text-muted-foreground text-xs tracking-wide"
                      inputClassName="w-24"
                    />
                    <InputField
                      nameInSchema={`entries.${index}.reason`}
                      fieldTitle={index === 0 ? "Reason" : ""}
                      formItemClassName="flex-1"
                      labelClassName="text-muted-foreground text-xs tracking-wide"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => entries.remove(index)}
                      className={cn("hover:text-destructive", index === 0 && "mt-6")}
                      disabled={entries.fields.length === 1}
                    >
                      <HugeiconsIcon icon={ICONS.DELETE} />
                    </Button>
                  </div>
                ))}

                <FormMessage>{form.getFieldState("entries").error?.message}</FormMessage>

                <Button
                  variant="outline-accent"
                  type="button"
                  size="sm"
                  onClick={() => entries.append({ amount: 0, reason: "" })}
                >
                  Add another entry
                </Button>
              </div>

              <div className="flex justify-end gap-2">
                <LoadingButton loading={isPending} type="submit" disabled={!isDirty || !isValid}>
                  {isPending ? "Saving..." : "Save changes"}
                </LoadingButton>
              </div>
            </form>
          </Form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
