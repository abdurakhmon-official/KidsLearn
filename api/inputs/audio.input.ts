import { z } from 'zod';
import { AUDIO_SOURCE } from '@/generated/prisma';

export const LOCALES = ['uz', 'ru', 'en'] as const;

export const LocaleSchema = z.enum(LOCALES).default('uz');

export const SpeakInputSchema = z.object({
  text: z.string().min(1).max(1000),
  locale: LocaleSchema,
});

export const SpeakBatchInputSchema = z.object({
  locale: LocaleSchema,
  texts: z.array(z.string().min(1).max(1000)).min(1).max(40),
});

export const UpsertPhraseAudioInputSchema = z.object({
  key: z.string().min(1).max(120),
  locale: LocaleSchema,
  text: z.string().min(1).max(1000),
  url: z.string().url(),
  source: z.nativeEnum(AUDIO_SOURCE).default(AUDIO_SOURCE.RECORDED),
  durationMs: z.coerce.number().int().min(0).optional().nullable(),
  active: z.boolean().default(true),
});

export const PhraseAudioSearchSchema = z.object({
  locale: z.enum(LOCALES).optional(),
});

export type Locale = z.infer<typeof LocaleSchema>;
export type SpeakInput = z.infer<typeof SpeakInputSchema>;
export type SpeakBatchInput = z.infer<typeof SpeakBatchInputSchema>;
export type UpsertPhraseAudioInput = z.infer<typeof UpsertPhraseAudioInputSchema>;
export type PhraseAudioSearch = z.infer<typeof PhraseAudioSearchSchema>;
