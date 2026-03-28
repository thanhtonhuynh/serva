import { z } from "zod";

const trimmedString = z.string().trim();

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^`+~.-])[A-Za-z\d@$!%*?&#^`+~.-]{8,}$/,
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
  );

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
    password: passwordSchema,
    confirmPassword: z.string(),
    inviteToken: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    error: "Passwords do not match",
  });
export type SignupInputs = z.infer<typeof SignupSchema>;

export const LoginSchema = z.object({
  email: z.email("Invalid email address").toLowerCase(),
  password: z.string(),
  inviteToken: z.string().optional(),
});
export type LoginInputs = z.infer<typeof LoginSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.email("Invalid email address").toLowerCase(),
});
export type ForgotPasswordSchemaTypes = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
    logOutOtherDevices: z.boolean().default(true).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    error: "Passwords do not match",
  });
export type ResetPasswordSchemaTypes = z.infer<typeof ResetPasswordSchema>;

export const VerificationCodeSchema = z.object({
  code: trimmedString.min(6, "Your verification code must be 6 characters."),
});
export type VerificationCodeSchemaTypes = z.infer<typeof VerificationCodeSchema>;

export const TwoFactorSetupSchema = z.object({
  code: trimmedString.min(6, "Your code must be 6 characters."),
  encodedTOTPKey: trimmedString.length(28),
});
export type TwoFactorSetupSchemaTypes = z.infer<typeof TwoFactorSetupSchema>;

export const TwoFactorVerificationSchema = z.object({
  code: trimmedString.min(6, "Your code must be 6 characters."),
});
export type TwoFactorVerificationSchemaTypes = z.infer<typeof TwoFactorVerificationSchema>;
