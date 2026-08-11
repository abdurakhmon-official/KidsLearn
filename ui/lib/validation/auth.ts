import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email kiriting").email("Email noto'g'ri"),
  password: z.string().min(1, "Parol kiriting"),
});

export const registerSchema = z.object({
  fullName: z.string().min(1, "Ism kiriting"),
  email: z.string().min(1, "Email kiriting").email("Email noto'g'ri"),
  password: z.string().min(6, "Parol kamida 6 ta belgi bo'lsin"),
  phone: z
    .string()
    .min(5, "Telefon raqami juda qisqa")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(1, "Ism kiriting"),
  phone: z
    .string()
    .min(5, "Telefon raqami juda qisqa")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export const updatePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Joriy parolni kiriting"),
    newPassword: z.string().min(6, "Parol kamida 6 ta belgi bo'lsin"),
    confirmPassword: z.string().min(1, "Parolni takrorlang"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Parollar mos kelmadi",
    path: ["confirmPassword"],
  })
  .refine((values) => values.oldPassword !== values.newPassword, {
    message: "Yangi parol joriysidan farq qilsin",
    path: ["newPassword"],
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordValues = z.infer<typeof updatePasswordSchema>;
