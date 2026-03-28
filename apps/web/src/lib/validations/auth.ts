import { z } from "zod";

export {
  SignupSchema,
  type SignupInputs,
  LoginSchema,
  type LoginInputs,
  ForgotPasswordSchema,
  type ForgotPasswordSchemaTypes,
  ResetPasswordSchema,
  type ResetPasswordSchemaTypes,
  VerificationCodeSchema,
  type VerificationCodeSchemaTypes,
  TwoFactorSetupSchema,
  type TwoFactorSetupSchemaTypes,
  TwoFactorVerificationSchema,
  type TwoFactorVerificationSchemaTypes,
} from "@serva/shared";

const trimmedString = z.string().trim();
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^`+~.-])[A-Za-z\d@$!%*?&#^`+~.-]{8,}$/,
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
  );

export const UpdateNameSchema = z.object({
  name: trimmedString
    .min(2, "Name must be at least 2 characters")
    .max(20, "Name must not exceed 20 characters")
    .transform((data) => {
      return data
        .split(" ")
        .map((word) => {
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(" ");
    }),
});
export type UpdateNameSchemaInput = z.infer<typeof UpdateNameSchema>;

export const UpdateEmailSchema = z.object({
  email: z.email("Invalid email address").toLowerCase(),
});
export type UpdateEmailSchemaInput = z.infer<typeof UpdateEmailSchema>;

export const UpdatePasswordSchema = z
  .object({
    currentPassword: z.string(),
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
    logOutOtherDevices: z.boolean().default(true).optional(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ["confirmNewPassword"],
    error: "Passwords do not match",
  });
export type UpdatePasswordSchemaInput = z.infer<typeof UpdatePasswordSchema>;

export const UpdateAvatarSchema = z.object({
  image: z
    .file({ error: "Required" })
    .refine(
      (file) =>
        file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/jpg" ||
        file.type === "image/webp",
      "Only JPEG, PNG, JPG, and WEBP formats are allowed",
    )
    .refine((file) => file.size <= MAX_IMAGE_SIZE, "Please upload a picture less than 5MB"),
});
export type UpdateAvatarSchemaInput = z.infer<typeof UpdateAvatarSchema>;
