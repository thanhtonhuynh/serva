"use client";

import { UpdateAvatarSchema, UpdateAvatarSchemaInput } from "@/libs/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Identity } from "@serva/auth/session";
import {
  Card,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  LoadingButton,
  ProfilePicture,
  Typography,
} from "@serva/serva-ui";
import { useTransition } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateAvatarAction } from "../actions";

type UpdateAvatarFormProps = {
  identity: Identity;
};

export function UpdateAvatar({ identity }: UpdateAvatarFormProps) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<UpdateAvatarSchemaInput>({
    resolver: zodResolver(UpdateAvatarSchema),
    mode: "onChange",
  });
  const { formState } = form;

  async function onSubmit(data: UpdateAvatarSchemaInput) {
    startTransition(async () => {
      const { error } = await updateAvatarAction(data);
      if (error) toast.error(error);
      else {
        toast.success("Profile picture updated.");
        form.reset();
      }
    });
  }

  return (
    <Card className="flex flex-col p-6 sm:flex-row sm:items-start">
      {/* Current profile picture */}
      <div className="shrink-0 self-center">
        <ProfilePicture image={identity.image} size={150} />
      </div>

      <div className="flex-1 space-y-3">
        <Typography variant="h2">Profile picture</Typography>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            {/* <FormField
              name="image"
              control={form.control}
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...fieldProps}
                      type="file"
                      accept="image/jpeg, image/png, image/jpg, image/webp"
                      onChange={(e) => onChange(e.target.files && e.target.files[0])}
                    />
                  </FormControl>
                  <FormDescription>
                    Image size must be less than 5MB and in JPEG, PNG, JPG, or WEBP format.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            <FieldGroup>
              <Controller
                name="image"
                control={form.control}
                render={({ field: { value, onChange, ...fieldProps }, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="image" className="sr-only">
                      Profile picture
                    </FieldLabel>
                    <Input
                      {...fieldProps}
                      type="file"
                      accept="image/jpeg, image/png, image/jpg, image/webp"
                      onChange={(e) => onChange(e.target.files && e.target.files[0])}
                    />
                    <FieldDescription>
                      Image size must be less than 5MB and in JPEG, PNG, JPG, or WEBP format.
                    </FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>

            {formState.isDirty && (
              <LoadingButton variant={"outline"} size={"sm"} loading={isPending} type="submit">
                {isPending ? "Uploading..." : "Upload"}
              </LoadingButton>
            )}
          </form>
        </FormProvider>
      </div>
    </Card>
  );
}
