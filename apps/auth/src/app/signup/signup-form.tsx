"use client";

import { LoadingButton } from "@serva/ui/components/serva/loading-button";
import { Callout, PasswordInputGroupInput, SIcon } from "@serva/ui";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@serva/ui/components/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@serva/ui/components/input-group";
import { SignupInputs, SignupSchema } from "@serva/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { signUpAction } from "./actions";

type Props = {
  inviteToken?: string;
  inviteEmail?: string;
  inviteName?: string;
};

export function SignUpForm({ inviteToken, inviteEmail, inviteName }: Props) {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const form = useForm<SignupInputs>({
    resolver: zodResolver(SignupSchema),
    mode: "onChange",
    defaultValues: {
      name: inviteName ?? "",
      email: inviteEmail ?? "",
      password: "",
      confirmPassword: "",
      inviteToken,
    },
  });

  async function onSubmit(data: SignupInputs) {
    setError(undefined);
    startTransition(async () => {
      const { error } = await signUpAction(data);

      if (error) setError(error);
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col space-y-6">
      {error && <Callout variant="error" message={error} />}

      {!inviteName && (
        <FieldGroup>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="serva-signup-name">Name</FieldLabel>
                <FieldDescription>Must be at least 2 characters long</FieldDescription>

                <InputGroup>
                  <InputGroupInput
                    {...field}
                    id="serva-signup-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="Name"
                  />
                  <InputGroupAddon align="inline-start">
                    <SIcon icon="USER" />
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>
      )}

      {!inviteEmail && (
        <FieldGroup>
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="serva-signup-email">Email</FieldLabel>

                <InputGroup>
                  <InputGroupInput
                    {...field}
                    id="serva-signup-email"
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
      )}

      <FieldGroup>
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <FieldDescription>
                Must be at least 8 characters long, contain at least one uppercase letter, one
                lowercase letter, one number, and one special character
              </FieldDescription>

              <InputGroup>
                <PasswordInputGroupInput
                  {...field}
                  id="password"
                  aria-invalid={fieldState.invalid}
                  placeholder="Enter password"
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
              <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
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

      <LoadingButton type="submit" className="w-full" loading={isPending}>
        Create account
      </LoadingButton>
    </form>
  );
}
