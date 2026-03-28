"use client";

import { LoadingButton } from "@/components/buttons/LoadingButton";
import { Callout, PasswordInputGroupInput, SIcon } from "@/components/shared";
import { Checkbox } from "@serva/ui/components/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "@serva/ui/components/field";
import { InputGroup, InputGroupAddon } from "@serva/ui/components/input-group";
import { ResetPasswordSchema, ResetPasswordSchemaTypes } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { resetPasswordAction } from "./actions";

export function ResetPasswordForm() {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const form = useForm<ResetPasswordSchemaTypes>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
      logOutOtherDevices: true,
    },
  });
  const router = useRouter();

  async function onSubmit(data: ResetPasswordSchemaTypes) {
    setError(undefined);
    startTransition(async () => {
      const { error } = await resetPasswordAction(data);

      if (error) {
        setError(error);
        return;
      }
      toast.success("Password reset successfully!");
      router.push("/login");
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col space-y-6">
      {error && <Callout variant="error" message={error} />}

      <FieldGroup>
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="password" className="sr-only">
                Password
              </FieldLabel>

              <InputGroup>
                <PasswordInputGroupInput
                  {...field}
                  id="password"
                  aria-invalid={fieldState.invalid}
                  placeholder="Password"
                />
                <InputGroupAddon align="inline-start">
                  <SIcon icon="LOCK_PASSWORD" />
                </InputGroupAddon>
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <FieldGroup>
        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="confirmPassword" className="sr-only">
                Confirm password
              </FieldLabel>
              <InputGroup>
                <PasswordInputGroupInput
                  {...field}
                  id="confirmPassword"
                  aria-invalid={fieldState.invalid}
                  placeholder="Re-enter password"
                />
                <InputGroupAddon align="inline-start">
                  <SIcon icon="LOCK_PASSWORD" />
                </InputGroupAddon>
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Controller
        name="logOutOtherDevices"
        control={form.control}
        render={({ field }) => (
          <FieldSet>
            <FieldGroup data-slot="checkbox-group">
              <Field orientation="horizontal">
                <Checkbox
                  id="logOutOtherDevices"
                  name={field.name}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <FieldLabel htmlFor="logOutOtherDevices">Sign out of other devices</FieldLabel>
              </Field>
            </FieldGroup>
          </FieldSet>
        )}
      />

      <LoadingButton
        type="submit"
        loading={isPending}
        disabled={!form.formState.isDirty || !form.formState.isValid}
        className="mt-3 w-full"
      >
        Reset Password
      </LoadingButton>
    </form>
  );
}
