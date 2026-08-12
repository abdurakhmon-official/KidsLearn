import { z } from 'zod';

export const CreateCategoryInputSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  audioUrl: z.string().url().optional().nullable(),
  order: z.coerce.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const UpdateCategoryInputSchema = CreateCategoryInputSchema.partial();

export type CreateCategoryInput = z.infer<typeof CreateCategoryInputSchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategoryInputSchema>;
