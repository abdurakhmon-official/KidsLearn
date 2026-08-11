import { z } from 'zod';
import { AGE_GROUP } from '@/generated/prisma';

const BirthDateSchema = z.coerce
  .date()
  .refine(date => date.getTime() <= Date.now(), { message: 'birth date cannot be in the future' })
  .refine(date => date.getUTCFullYear() >= new Date().getFullYear() - 18, {
    message: 'birth date is out of the supported range',
  });

export const CreateChildInputSchema = z.object({
  fullName: z.string().min(1),
  birthDate: BirthDateSchema,
  avatar: z.string().optional().nullable(),
  parentId: z.string().optional(),
});

export const UpdateChildInputSchema = z.object({
  fullName: z.string().min(1).optional(),
  birthDate: BirthDateSchema.optional(),
  avatar: z.string().optional().nullable(),
  active: z.boolean().optional(),
});

export const ChildSearchSchema = z.object({
  age: z.coerce.number().int().min(0).max(18).optional(),
  ageGroup: z.nativeEnum(AGE_GROUP).optional(),
  parentId: z.string().optional(),
  active: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform(value => value === true || value === 'true')
    .optional(),
});

export type CreateChildInput = z.infer<typeof CreateChildInputSchema>;
export type UpdateChildInput = z.infer<typeof UpdateChildInputSchema>;
export type ChildSearch = z.infer<typeof ChildSearchSchema>;
