import { z } from "zod";

// Signup Form
// zod.object().refine() does not support omit, so work around is
// to have a base schema, then:
//  - schema with refinement (double checks email)
//  - schema without confirm (strips email conf for server)
export const emailVerificationRequestFormSchemaBase = z.object({
  username: z.string().min(1, { message: "name is required" }),
  email: z
    .string()
    .email({ message: "must be valid" })
    .transform((email) => email.toLowerCase()),
  confirmEmail: z.string().transform((email) => email.toLowerCase()),
});
export const emailVerificationRequestFormSchemaWithConfirmation =
  emailVerificationRequestFormSchemaBase.refine(
    (data) => data.email === data.confirmEmail,
    {
      message: "emails do not match",
      path: ["confirmEmail"],
    },
  );
// zod.object().refine() does not support omit, so use base schema
export const emailVerificationRequestFormSchema =
  emailVerificationRequestFormSchemaBase.omit({
    confirmEmail: true,
  });
export type EmailVerificationRequestFormSchemaWithConfirmation = z.infer<
  typeof emailVerificationRequestFormSchemaWithConfirmation
>;
export type EmailVerificationRequestFormSchema = z.infer<
  typeof emailVerificationRequestFormSchema
>;

// OTP Form
export const emailVerificationOTPFormSchema = z.object({
  email: z
    .string()
    .email({ message: "must be valid" })
    .transform((email) => email.toLowerCase()),
  code: z.string().min(1, { message: "code is required" }),
});
export type EmailVerificationOTPFormSchema = z.infer<
  typeof emailVerificationOTPFormSchema
>;

export const signupFormSchemaBase = z.object({
  email: z.string().email({ message: "must be valid" }),
  password: z.string().min(8, { message: "min. 8 characters long" }),
  confirmPassword: z.string(),
});
export const signupFormSchemaWithPasswordConfirmation =
  signupFormSchemaBase.refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "passwords do not match",
      path: ["confirmPassword"],
    },
  );
export const signupFormSchema = signupFormSchemaBase.omit({
  confirmPassword: true,
});
export type SignupFormSchemaWithPasswordConfirmation = z.infer<
  typeof signupFormSchemaWithPasswordConfirmation
>;
export type SignupFormSchema = z.infer<typeof signupFormSchema>;

// Login Form
export const loginFormSchema = z.object({
  email: z.string().email({ message: "must be valid" }),
  password: z.string().min(1, { message: "required" }),
});
export type LoginFormSchema = z.infer<typeof loginFormSchema>;
