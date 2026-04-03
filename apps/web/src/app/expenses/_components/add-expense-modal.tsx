"use client";

import { ExpensesFormInput, ExpensesFormSchema } from "@/libs/validations/expenses";
import { getLocalDateFromUTC, getUTCMidnightFromLocal } from "@/utils/datetime-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Button,
  Calendar,
  cn,
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  ICONS,
  LoadingButton,
} from "@serva/serva-ui";
import { InputField } from "@serva/serva-ui/components/form/input-field";
import { getTodayUTCMidnight } from "@serva/shared";
import { ReactElement, useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { addExpensesAction } from "../actions";

type Props = {
  children: ReactElement;
  defaultDate?: Date; // For "Add for this period" button
};

export function AddExpenseModal({ children, defaultDate }: Props) {
  // Convert default date to local date for calendar display
  const initialDate = getLocalDateFromUTC(defaultDate ?? getTodayUTCMidnight());

  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>(initialDate);

  const form = useForm<ExpensesFormInput>({
    mode: "onChange",
    resolver: zodResolver(ExpensesFormSchema),
    defaultValues: {
      date: initialDate,
      entries: [{ amount: 0, reason: "" }],
    },
  });

  const entries = useFieldArray({ control: form.control, name: "entries" });
  const [isPending, startTransition] = useTransition();
  const { isDirty, isValid } = form.formState;

  async function onSubmit(data: ExpensesFormInput) {
    // Normalize date to UTC midnight before submitting
    data.date = getUTCMidnightFromLocal(data.date);

    startTransition(async () => {
      const { error } = await addExpensesAction(data);

      if (error) {
        toast.error(error);
      } else {
        toast.success("Expense added successfully");
        form.reset();
        setOpen(false);
      }
    });
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    // if (nextOpen) {
    //   // Reset form when dialog opens
    //   form.reset({ date: initialDate, entries: [{ amount: 0, reason: "" }] });
    //   setMonth(new Date(initialDate.getFullYear(), initialDate.getMonth()));
    // }
    if (!nextOpen) form.reset();
  }

  return (
    <Dialog disablePointerDismissal open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={children} />

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader showBorder>
          <DialogTitle>Add expense</DialogTitle>
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
                        className="rounded-xl border"
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
                  {isPending ? "Saving..." : "Save expense"}
                </LoadingButton>
              </div>
            </form>
          </Form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
