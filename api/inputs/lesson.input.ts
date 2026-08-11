import { z } from 'zod';
import { AGE_GROUP, MEDIA_TYPE, PROGRESS_STATUS } from '@/generated/prisma';

export const LessonMediaInputSchema = z.object({
  type: z.nativeEnum(MEDIA_TYPE),
  url: z.string().url(),
  caption: z.string().optional().nullable(),
  order: z.coerce.number().int().min(0).default(0),
});

export const CreateLessonInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  categoryId: z.string().min(1),
  ageGroup: z.nativeEnum(AGE_GROUP),
  coverImage: z.string().url().optional().nullable(),
  videoUrl: z.string().url().optional().nullable(),
  audioUrl: z.string().url().optional().nullable(),
  points: z.coerce.number().int().min(0).max(1000).default(10),
  order: z.coerce.number().int().min(0).default(0),
  active: z.boolean().default(true),
  media: z.array(LessonMediaInputSchema).optional(),
});

export const UpdateLessonInputSchema = CreateLessonInputSchema.partial();

export const LessonSearchSchema = z.object({
  ageGroup: z.nativeEnum(AGE_GROUP).optional(),
  categoryId: z.string().optional(),
  active: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform(value => value === true || value === 'true')
    .optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const LessonProgressInputSchema = z.object({
  status: z.nativeEnum(PROGRESS_STATUS).optional(),
  progressPercent: z.coerce.number().int().min(0).max(100).optional(),
  watchedSeconds: z.coerce.number().int().min(0).optional(),
});

export type LessonMediaInput = z.infer<typeof LessonMediaInputSchema>;
export type CreateLessonInput = z.infer<typeof CreateLessonInputSchema>;
export type UpdateLessonInput = z.infer<typeof UpdateLessonInputSchema>;
export type LessonSearch = z.infer<typeof LessonSearchSchema>;
export type LessonProgressInput = z.infer<typeof LessonProgressInputSchema>;
