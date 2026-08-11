import { z } from 'zod';
import { MEDIA_TYPE } from '@/generated/prisma';

export const RegisterMediaInputSchema = z.object({
  type: z.nativeEnum(MEDIA_TYPE),
  url: z.string().url(),
  key: z.string().min(1),
  originalName: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.coerce.number().int().min(0),
});

export const MediaSearchSchema = z.object({
  type: z.nativeEnum(MEDIA_TYPE).optional(),
});

export type RegisterMediaInput = z.infer<typeof RegisterMediaInputSchema>;
export type MediaSearch = z.infer<typeof MediaSearchSchema>;
