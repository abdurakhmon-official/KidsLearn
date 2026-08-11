import { z } from 'zod';

export const RegisterInputSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(5).optional().nullable(),
  avatar: z.string().url().optional().nullable(),
});

export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const UpdateProfileInputSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(5).optional().nullable(),
  avatar: z.string().url().optional().nullable(),
});

export const UpdatePasswordInputSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string().min(6),
});

export type RegisterInput = z.infer<typeof RegisterInputSchema>;
export type LoginInput = z.infer<typeof LoginInputSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;
export type UpdatePasswordInput = z.infer<typeof UpdatePasswordInputSchema>;
