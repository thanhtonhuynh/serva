"use client";

import { LoadingButton } from "@/components/buttons/LoadingButton";
import { Callout, PasswordInputGroupInput, SIcon } from "@/components/shared";
import { Field, FieldError, FieldGroup, FieldLabel } from "@serva/ui/components/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@serva/ui/components/input-group";
import { LoginInputs, LoginSchema } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { loginAction } from "./actions";

type Props = {
  inviteToken?: string;
  inviteEmail?: string;
};

export function LoginForm({ inviteToken, inviteEmail }: Props) {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const form = useForm<LoginInputs>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: inviteEmail ?? "",
      password: "",
      inviteToken,
    },
  });

  async function onSubmit(data: LoginInputs) {
    setError(undefined);
    startTransition(async () => {
      const { error } = await loginAction(data);

      if (error) setError(error);
    });

    form.resetField("password");
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-6">
      {/* Temporary. Remove later. */}
      {!inviteEmail && (
        <Callout
          variant="info"
          message={
            <div className="flex flex-col gap-1">
              <span>We have removed username as a login method.</span>
              <span>Please use your email to login.</span>
            </div>
          }
        />
      )}
      {error && <Callout variant="error" message={error} />}

      {!inviteEmail && (
        <FieldGroup>
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="serva-login-email" className="sr-only">
                  Email
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    id="serva-login-email"
                    type="email"
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

      {!inviteEmail && (
        <Link
          className="-mt-3 w-fit self-end text-xs font-medium hover:underline"
          href="/login/forgot-password"
        >
          Forgot password?
        </Link>
      )}
      <LoadingButton type="submit" className="w-full" loading={isPending}>
        Login
      </LoadingButton>
    </form>
  );
}
