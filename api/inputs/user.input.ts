import { z } from 'zod';
import { USER_ROLE } from '@/generated/prisma';

export const CreateUserInputSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(USER_ROLE).default(USER_ROLE.PARENT),
  phone: z.string().min(5).optional().nullable(),
  avatar: z.string().url().optional().nullable(),
});

export const UpdateUserInputSchema = z.object({
  fullName: z.string().min(1).optional(),
  phone: z.string().min(5).optional().nullable(),
  avatar: z.string().url().optional().nullable(),
  role: z.nativeEnum(USER_ROLE).optional(),
});

export const UpdateUserStatusInputSchema = z.object({
  active: z.boolean(),
});

export const UserSearchSchema = z.object({
  role: z.nativeEnum(USER_ROLE).optional(),
  active: z.coerce.boolean().optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>;
export type UpdateUserStatusInput = z.infer<typeof UpdateUserStatusInputSchema>;
export type UserSearch = z.infer<typeof UserSearchSchema>;
