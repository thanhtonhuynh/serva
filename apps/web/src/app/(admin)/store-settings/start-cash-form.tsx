"use client";

import { LoadingButton } from "@/components/buttons/LoadingButton";
import { Callout } from "@/components/shared";
import { Typography } from "@/components/shared/typography";
import { Card } from "@serva/ui/components/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@serva/ui/components/form";
import { Input } from "@serva/ui/components/input";
import { UpdateStartCashInput, UpdateStartCashSchema } from "@/lib/validations/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
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
    mode: "onBlur",
    defaultValues: {
      startCash: currentStartCash,
    },
  });

  async function onSubmit(data: UpdateStartCashInput) {
    startTransition(async () => {
      const { error } = await updateStartCash(data);

      if (error) {
        setError(error);
      } else {
        setSuccess(true);

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
        <p>Update the start cash amount.</p>
        <p>
          <span className="font-semibold">Note:</span> Any changes to the start cash amount will be
          applied to the next sales report. The past reports will not be affected.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          {error && <Callout variant="error" message={error} />}
          {success && <Callout variant="success" message="Start cash updated" />}

          <FormField
            name={"startCash"}
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Start cash</FormLabel>
                <FormControl>
                  <Input {...field} type="number" value={field.value as string} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <LoadingButton size={"sm"} variant={"outline"} loading={isPending} type="submit">
            Update start cash
          </LoadingButton>
        </form>
      </Form>
    </Card>
  );
}
