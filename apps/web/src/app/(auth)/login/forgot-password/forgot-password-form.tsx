"use client";

import { LoadingButton } from "@serva/ui/components/serva/loading-button";
import { Callout, SIcon } from "@serva/ui";
import { Field, FieldError, FieldGroup, FieldLabel } from "@serva/ui/components/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@serva/ui/components/input-group";
import { ForgotPasswordSchema, ForgotPasswordSchemaTypes } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { forgotPasswordAction } from "./actions";

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const form = useForm<ForgotPasswordSchemaTypes>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordSchemaTypes) {
    startTransition(async () => {
      const { error } = await forgotPasswordAction(data);
      if (error) {
        setError(error);
      } else {
        setSuccess(
          "We've sent you an email with a link to reset your password.\nPlease check your inbox.",
        );
      }
      form.reset();
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-6">
      {error && <Callout variant="error" message={error} />}
      {success && <Callout variant="success" message={success} />}

      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="serva-forgot-password-email" className="sr-only">
                Email
              </FieldLabel>

              <InputGroup>
                <InputGroupInput
                  {...field}
                  id="serva-forgot-password-email"
                  aria-invalid={fieldState.invalid}
                  placeholder="Email"
                />
                <InputGroupAddon align="inline-start">
                  <SIcon icon="MAIL" />
                </InputGroupAddon>
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <LoadingButton
        type="submit"
        loading={isPending}
        disabled={!form.formState.isDirty || !form.formState.isValid}
        className="w-full"
      >
        Send password reset email
      </LoadingButton>
    </form>
  );
}
