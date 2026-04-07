"use client";

import { UpdateNameSchema, UpdateNameSchemaInput } from "@/libs/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Identity } from "@serva/auth/session";
import { Card, FieldDescription, LoadingButton, Typography } from "@serva/serva-ui";
import { InputField } from "@serva/serva-ui/components/form/input-field";
import { useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateNameAction } from "../actions";

type Props = {
  identity: Identity;
};

export function UpdateNameForm({ identity }: Props) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<UpdateNameSchemaInput>({
    resolver: zodResolver(UpdateNameSchema),
    mode: "onChange",
    defaultValues: {
      name: identity.name,
    },
  });
  const { formState } = form;

  async function onSubmit(data: UpdateNameSchemaInput) {
    startTransition(async () => {
      const { error } = await updateNameAction(data);
      if (error) toast.error(error);
      else {
        toast.success("Name updated.");
        form.reset(data);
      }
    });
  }

  return (
    <Card className="p-6">
      <Typography variant="h2">Full name</Typography>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <InputField fieldName="name" htmlFor="name" placeholder="Serva" />
          <FieldDescription>Must be at least 2 characters.</FieldDescription>

          {formState.isDirty && (
            <LoadingButton size={"sm"} variant={"outline"} loading={isPending} type="submit">
              {isPending ? "Saving..." : "Save"}
            </LoadingButton>
          )}
        </form>
      </FormProvider>
    </Card>
  );
}
