"use client";

import { LoadingButton } from "@/components/buttons/LoadingButton";
import { ErrorMessage, SuccessMessage } from "@/components/shared/noti-message";
import { Typography } from "@/components/shared/typography";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
          {error && <ErrorMessage message={error} />}
          {success && <SuccessMessage message="Start cash updated" />}

          <FormField
            name={"startCash"}
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Start cash</FormLabel>
                <FormControl>
                  <Input {...field} type="number" />
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
