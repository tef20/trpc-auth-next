import { z } from "zod";

// Signup Form
export const signupFormSchema = z.object({
  email: z.string().email({ message: "must be valid" }),
  password: z.string().min(8, { message: "min. 8 characters long" }),
});

export type SignupFormSchema = z.infer<typeof signupFormSchema>;

// Login Form
export const loginFormSchema = z.object({
  email: z.string().email({ message: "must be valid" }),
  password: z.string().min(1, { message: "required" }),
});

export type LoginFormSchema = z.infer<typeof loginFormSchema>;
