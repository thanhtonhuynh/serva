"use client";

import { ExpensesFormInput, ExpensesFormSchema } from "@/libs/validations/expenses";
import { getLocalDateFromUTC, getUTCMidnightFromLocal } from "@/utils/datetime-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { HugeiconsIcon } from "@hugeicons/react";
import { Expense } from "@serva/database";
import {
  Button,
  Calendar,
  cn,
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  ICONS,
  LoadingButton,
} from "@serva/serva-ui";
import { InputFieldV2 } from "@serva/serva-ui/components/form/input-field-v2";
import { useEffect, useState, useTransition } from "react";
import { Controller, FormProvider, useFieldArray, useForm } from "react-hook-form";
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
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FieldGroup>
                <Controller
                  name="date"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-1.5">
                      <FieldLabel htmlFor="edit-expense-date-input">Date</FieldLabel>
                      <Calendar
                        mode="single"
                        selected={field.value}
                        id="edit-expense-date-input"
                        onSelect={field.onChange}
                        onDayClick={field.onChange}
                        month={month}
                        onMonthChange={setMonth}
                        startMonth={new Date(2024, 9)}
                        captionLayout="dropdown"
                        className="w-full rounded-xl border"
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </FieldGroup>

              <div className="space-y-3">
                {entries.fields.map((entry, index) => (
                  <div key={entry.id} className="flex items-start gap-2">
                    <div className="w-40">
                      <InputFieldV2
                        fieldName={`entries.${index}.amount`}
                        label={index === 0 ? "Amount" : ""}
                        type="number"
                        htmlFor={`entries.${index} - amount input`}
                      />
                    </div>
                    <InputFieldV2
                      fieldName={`entries.${index}.reason`}
                      label={index === 0 ? "Reason" : ""}
                      htmlFor={`entries.${index} - reason input`}
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

                <FieldError errors={[form.getFieldState("entries").error]} />

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
          </FormProvider>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
