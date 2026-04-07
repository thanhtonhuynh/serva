"use client";

import { UpdateStartCashInput, UpdateStartCashSchema } from "@/libs/validations/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Callout, Card, LoadingButton, Typography } from "@serva/serva-ui";
import { InputField } from "@serva/serva-ui/components/form/input-field";
import { useState, useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { updateStartCash } from "./actions";

type ShiftHoursFormProps = {
  currentStartCash: number;
};

export function StartCashForm({ currentStartCash }: ShiftHoursFormProps) {
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const form = useForm<UpdateStartCashInput>({
    resolver: zodResolver(UpdateStartCashSchema),
    mode: "onChange",
    defaultValues: {
      startCash: currentStartCash,
    },
  });
  const { formState } = form;

  async function onSubmit(data: UpdateStartCashInput) {
    startTransition(async () => {
      const { error } = await updateStartCash(data);

      if (error) {
        setError(error);
      } else {
        setSuccess(true);
        form.reset(data);

        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      }
    });
  }

  return (
    <Card className="p-6">
      <Typography variant="h2">Start Cash</Typography>

      <div className="text-muted-foreground space-y-1 text-sm">
        <p>
          The start cash amount is the amount of money that the store has at the beginning of the
          day.
        </p>
        <p>
          <span className="font-semibold">Note:</span> Any changes to the start cash amount will be
          applied to the next sales report. The past reports will not be affected.
        </p>
      </div>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          {error && <Callout variant="error" message={error} />}
          {success && <Callout variant="success" message="Start cash updated" />}

          <InputField fieldName="startCash" htmlFor="startCash" type="number" placeholder="0.00" />

          {formState.isDirty && (
            <LoadingButton size={"sm"} variant={"outline"} loading={isPending} type="submit">
              {isPending ? "Updating..." : "Update start cash"}
            </LoadingButton>
          )}
        </form>
      </FormProvider>
    </Card>
  );
}
