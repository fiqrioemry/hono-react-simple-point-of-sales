import { z } from "zod";

export const loginRequest = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerRequest = z
  .object({
    name: z.string().min(1, "Name is required").max(100),
    email: z.email("Invalid email address"),
    password: z
      .string()
      .min(6, "Password  is must be at least 6 characters")
      .max(100),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password  is must be at least 6 characters")
      .max(100),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const changePassRequest = z
  .object({
    currentPassword: z.string().min(6, "Current Password is required"),
    newPassword: z
      .string()
      .min(6, "New Password is must be at least 6 characters")
      .max(100),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password is must be at least 6 characters")
      .max(100),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const resetPasswordRequest = z.object({
  newPassword: z
    .string()
    .min(6, "Password  is must be at least 6 characters")
    .max(100),
  confirmPassword: z
    .string()
    .min(6, "Confirm Password  is must be at least 6 characters")
    .max(100),
});

export const tokenQuery = z.uuid("Invalid token");

export const emailRequest = z.email("Invalid email address");

export const userResponse = z.object({
  id: z.uuid(),
  name: z.string(),
  image: z.url(),
  email: z.email(),
  role: z.enum(["STAFF", "ADMIN"]),
  lastLogin: z
    .date()
    .transform((date) => date.toISOString())
    .nullable(),
  createdAt: z.date().transform((date) => date.toISOString()),
});

export type ChangePassRequest = z.infer<typeof changePassRequest>;
export type LoginRequest = z.infer<typeof loginRequest>;
export type UserResponse = z.infer<typeof userResponse>;
export type TokenQuery = z.infer<typeof tokenQuery>;
export type RegisterRequest = z.infer<typeof registerRequest>;
