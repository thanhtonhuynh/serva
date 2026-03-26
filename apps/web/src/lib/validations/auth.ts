import { z } from "zod";

const trimmedString = z.string().trim();
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Sign up
export const SignupSchema = z
  .object({
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
    email: z.email("Invalid email address").toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^`+~.-])[A-Za-z\d@$!%*?&#^`+~.-]{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ),
    confirmPassword: z.string(),
    inviteToken: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    error: "Passwords do not match",
  });
export type SignupInputs = z.infer<typeof SignupSchema>;

// Login
export const LoginSchema = z.object({
  email: z.email("Invalid email address").toLowerCase(),
  password: z.string(),
  inviteToken: z.string().optional(),
});
export type LoginInputs = z.infer<typeof LoginSchema>;

// Update name, make first letter of every word uppercase
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

// Update email
export const UpdateEmailSchema = z.object({
  email: z.email("Invalid email address").toLowerCase(),
});
export type UpdateEmailSchemaInput = z.infer<typeof UpdateEmailSchema>;

// Update password
export const UpdatePasswordSchema = z
  .object({
    currentPassword: z.string(),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^`+~.-])[A-Za-z\d@$!%*?&#^`+~.-]{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ),
    confirmNewPassword: z.string(),
    logOutOtherDevices: z.boolean().default(true).optional(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ["confirmNewPassword"],
    error: "Passwords do not match",
  });
export type UpdatePasswordSchemaInput = z.infer<typeof UpdatePasswordSchema>;

// Update profile picture
// Only allow image/jpeg, image/png, image/jpg, image/webp format
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

// Verification code
export const VerificationCodeSchema = z.object({
  code: trimmedString.min(6, "Your verification code must be 6 characters."),
});
export type VerificationCodeSchemaTypes = z.infer<typeof VerificationCodeSchema>;

// Forgot password
export const ForgotPasswordSchema = z.object({
  email: z.email("Invalid email address").toLowerCase(),
});
export type ForgotPasswordSchemaTypes = z.infer<typeof ForgotPasswordSchema>;

// Reset password
export const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^`+~.-])[A-Za-z\d@$!%*?&#^`+~.-]{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ),
    confirmPassword: z.string(),
    logOutOtherDevices: z.boolean().default(true).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    error: "Passwords do not match",
  });
export type ResetPasswordSchemaTypes = z.infer<typeof ResetPasswordSchema>;

// Set up two-factor authentication
export const TwoFactorSetupSchema = z.object({
  code: trimmedString.min(6, "Your code must be 6 characters."),
  encodedTOTPKey: trimmedString.length(28),
});
export type TwoFactorSetupSchemaTypes = z.infer<typeof TwoFactorSetupSchema>;

// Verify two-factor authentication
export const TwoFactorVerificationSchema = z.object({
  code: trimmedString.min(6, "Your code must be 6 characters."),
});
export type TwoFactorVerificationSchemaTypes = z.infer<typeof TwoFactorVerificationSchema>;
