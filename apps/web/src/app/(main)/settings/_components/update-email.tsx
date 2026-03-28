"use client";

import { LoadingButton } from "@serva/ui/components/serva/loading-button";
import { Typography } from "@serva/ui/components/serva/typography";
import { Card } from "@serva/ui/components/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@serva/ui/components/form";
import { Input } from "@serva/ui/components/input";
import { type Identity } from "@serva/auth/session";
import { UpdateEmailSchema, UpdateEmailSchemaInput } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            name="email"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} placeholder="example@gmail.com" />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <LoadingButton variant={"outline"} size={"sm"} loading={isPending} type="submit">
            Save
          </LoadingButton>
        </form>
      </Form>
    </Card>
  );
}
