"use client";

import { LoadingButton } from "@/components/buttons/LoadingButton";
import { ErrorMessage, SuccessMessage } from "@/components/shared/noti-message";
import { Typography } from "@/components/shared/typography";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { PLATFORMS } from "@/constants/platforms";
import { UpdateActivePlatformsInput, UpdateActivePlatformsSchema } from "@/lib/validations/store";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { updateActivePlatforms } from "./actions";

type PlatformsFormProps = {
  currentActivePlatformIds: string[];
};

export function PlatformsForm({ currentActivePlatformIds }: PlatformsFormProps) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const form = useForm<UpdateActivePlatformsInput>({
    resolver: zodResolver(UpdateActivePlatformsSchema),
    defaultValues: {
      activePlatforms: currentActivePlatformIds,
    },
  });
  const { formState } = form;

  function onSubmit(data: UpdateActivePlatformsInput) {
    setError(undefined);
    setSuccess(false);

    startTransition(async () => {
      const { error } = await updateActivePlatforms(data);

      if (error) {
        setError(error);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 5000);
      }
    });
  }

  return (
    <Card className="p-6">
      <Typography variant="h2">Online Platforms</Typography>

      <div className="text-muted-foreground space-y-1 text-sm">
        <p>
          Select which online platforms are active for your store. Only active platforms will appear
          in sales report forms.
        </p>
        <p>
          <span className="font-semibold">Note:</span> Deactivating a platform will not delete any
          existing sales data for that platform.
        </p>
      </div>

      <form id="platforms-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && <ErrorMessage message={error} />}
        {success && <SuccessMessage message="Platforms updated" />}

        <Controller
          name="activePlatforms"
          control={form.control}
          render={({ field, fieldState }) => (
            <FieldSet data-invalid={fieldState.invalid}>
              <FieldGroup data-slot="checkbox-group">
                {PLATFORMS.map((platform) => (
                  <Field
                    key={platform.id}
                    orientation="horizontal"
                    data-invalid={fieldState.invalid}
                  >
                    <Checkbox
                      id={`platforms-form-${platform.id}`}
                      name={field.name}
                      aria-invalid={fieldState.invalid}
                      checked={field.value.includes(platform.id)}
                      onCheckedChange={(checked) => {
                        const newValue = checked
                          ? [...field.value, platform.id]
                          : field.value.filter((value) => value !== platform.id);
                        field.onChange(newValue);
                      }}
                    />
                    <FieldLabel htmlFor={`platforms-form-${platform.id}`} className="font-normal">
                      <Image
                        src={platform.iconSrc}
                        alt={`${platform.label} icon`}
                        width={30}
                        height={30}
                      />
                      {platform.label}
                    </FieldLabel>
                  </Field>
                ))}
              </FieldGroup>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldSet>
          )}
        />

        {formState.isDirty && (
          <LoadingButton size="sm" variant="outline" loading={isPending} type="submit">
            Update platforms
          </LoadingButton>
        )}
      </form>
    </Card>
  );
}
