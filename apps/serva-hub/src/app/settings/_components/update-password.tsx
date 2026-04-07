"use client";

import { UpdatePasswordSchema, UpdatePasswordSchemaInput } from "@/libs/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  Checkbox,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  LoadingButton,
  PasswordInput,
  Typography,
} from "@serva/serva-ui";
import { useTransition } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { updatePasswordAction } from "../actions";

export function UpdatePasswordForm() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<UpdatePasswordSchemaInput>({
    resolver: zodResolver(UpdatePasswordSchema),
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
      logOutOtherDevices: true,
    },
  });
  const { formState } = form;

  async function onSubmit(data: UpdatePasswordSchemaInput) {
    startTransition(async () => {
      const { error } = await updatePasswordAction(data);
      if (error) toast.error(error);
      else {
        toast.success("Password updated.");
        form.reset();
      }
    });
  }

  return (
    <Card className="p-6">
      <Typography variant="h2">Password</Typography>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FieldGroup>
            <Controller
              name="currentPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="change-password-current-password">
                    Current password
                  </FieldLabel>
                  <PasswordInput
                    {...field}
                    id="change-password-current-password"
                    aria-invalid={fieldState.invalid}
                    placeholder="Current password"
                  />

                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>

          <FieldGroup>
            <Controller
              name="newPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="change-password-new-password">New password</FieldLabel>
                  <PasswordInput
                    {...field}
                    id="change-password-new-password"
                    aria-invalid={fieldState.invalid}
                    placeholder="New password"
                  />
                  <FieldDescription>
                    Must be at least 8 characters long, contain at least one uppercase letter, one
                    lowercase letter, one number, and one special character
                  </FieldDescription>

                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>

          <FieldGroup>
            <Controller
              name="confirmNewPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="change-password-confirm-password">
                    Confirm new password
                  </FieldLabel>
                  <PasswordInput
                    {...field}
                    id="change-password-confirm-password"
                    aria-invalid={fieldState.invalid}
                    placeholder="Re-enter new password"
                  />

                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>

          <div className="text-muted-foreground text-sm">
            Please sign out of other devices if you think your account has been compromised.
          </div>

          <FieldGroup>
            <Controller
              name="logOutOtherDevices"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                  <Checkbox
                    id="change-password-log-out-other-devices"
                    name={field.name}
                    aria-invalid={fieldState.invalid}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <FieldLabel htmlFor="change-password-log-out-other-devices">
                    Sign out of other devices
                  </FieldLabel>
                </Field>
              )}
            />
          </FieldGroup>

          {formState.isDirty && (
            <LoadingButton type="submit" size={"sm"} loading={isPending} variant={"outline"}>
              {isPending ? "Updating..." : "Update password"}
            </LoadingButton>
          )}
        </form>
      </FormProvider>
    </Card>
  );
}
