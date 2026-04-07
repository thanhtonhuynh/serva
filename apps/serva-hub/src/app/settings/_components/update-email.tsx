"use client";

import { UpdateEmailSchema, UpdateEmailSchemaInput } from "@/libs/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Identity } from "@serva/auth/session";
import { Card, LoadingButton, Typography } from "@serva/serva-ui";
import { InputFieldV2 } from "@serva/serva-ui/components/form/input-field-v2";
import { useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateEmailAction } from "../actions";

type Props = {
  identity: Identity;
};

export function UpdateEmailForm({ identity }: Props) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<UpdateEmailSchemaInput>({
    resolver: zodResolver(UpdateEmailSchema),
    mode: "onBlur",
    defaultValues: {
      email: identity.email,
    },
  });

  async function onSubmit(data: UpdateEmailSchemaInput) {
    startTransition(async () => {
      const { error } = await updateEmailAction(data);
      if (error) toast.error(error);
      else toast.success("Email updated.");
    });
  }

  return (
    <Card className="p-6">
      <Typography variant="h2">Email</Typography>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <InputFieldV2
            fieldName="email"
            label="Email"
            type="email"
            htmlFor="email"
            placeholder="serva@example.com"
          />

          <LoadingButton variant={"outline"} size={"sm"} loading={isPending} type="submit">
            Save
          </LoadingButton>
        </form>
      </FormProvider>
    </Card>
  );
}
