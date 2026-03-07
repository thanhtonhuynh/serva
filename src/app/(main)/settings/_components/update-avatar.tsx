"use client";

import { LoadingButton } from "@/components/buttons/LoadingButton";
import { ProfilePicture } from "@/components/shared/profile-picture";
import { Typography } from "@/components/shared/typography";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { User } from "@/lib/auth/session";
import { UpdateAvatarSchema, UpdateAvatarSchemaInput } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateAvatarAction } from "../actions";

type UpdateAvatarFormProps = {
  user: User;
};

export function UpdateAvatar({ user }: UpdateAvatarFormProps) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<UpdateAvatarSchemaInput>({
    resolver: zodResolver(UpdateAvatarSchema),
    mode: "onBlur",
  });

  async function onSubmit(data: UpdateAvatarSchemaInput) {
    startTransition(async () => {
      const { error } = await updateAvatarAction(data);
      if (error) toast.error(error);
      else toast.success("Profile picture updated.");
    });
  }

  return (
    <Card className="flex flex-col p-6 sm:flex-row sm:items-center">
      {/* Current profile picture */}
      <div className="shrink-0 self-center">
        <ProfilePicture image={user.image} size={150} />
      </div>

      <div className="space-y-4">
        <Typography variant="h2">Profile picture</Typography>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
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
            />
            <LoadingButton variant={"outline"} size={"sm"} loading={isPending} type="submit">
              Upload
            </LoadingButton>
          </form>
        </Form>
      </div>
    </Card>
  );
}
