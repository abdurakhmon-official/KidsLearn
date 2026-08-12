import { z } from 'zod';
import { AGE_GROUP, GAME_TYPE } from '@/generated/prisma';
import { MAX_MOVES } from '@/utils/game-rules';

export const GameOptionSchema = z.object({
  value: z.string().min(1),
  label: z.string().optional().nullable(),
  image: z.string().url().optional().nullable(),
  audio: z.string().url().optional().nullable(),
  color: z.string().optional().nullable(),
});

export const GameItemInputSchema = z
  .object({
    promptText: z.string().optional().nullable(),
    promptImage: z.string().url().optional().nullable(),
    promptAudio: z.string().url().optional().nullable(),
    correctValue: z.string().min(1),
    options: z.array(GameOptionSchema).min(1),
    order: z.coerce.number().int().min(0).default(0),
    active: z.boolean().default(true),
  })
  .refine(item => item.options.some(option => option.value === item.correctValue), {
    message: 'correctValue must match one of the options',
    path: ['correctValue'],
  });

export const CreateGameInputSchema = z.object({
  code: z.nativeEnum(GAME_TYPE),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  ageGroup: z.nativeEnum(AGE_GROUP),
  coverImage: z.string().url().optional().nullable(),
  instructionAudio: z.string().url().optional().nullable(),
  pointsPerCorrect: z.coerce.number().int().min(0).max(100).default(5),
  config: z.record(z.any()).optional().nullable(),
  order: z.coerce.number().int().min(0).default(0),
  active: z.boolean().default(true),
  items: z.array(GameItemInputSchema).optional(),
});

export const UpdateGameInputSchema = CreateGameInputSchema.partial();

export const GameSearchSchema = z.object({
  ageGroup: z.nativeEnum(AGE_GROUP).optional(),
  code: z.nativeEnum(GAME_TYPE).optional(),
  categoryId: z.string().optional(),
  active: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform(value => value === true || value === 'true')
    .optional(),
});

export const SubmitGameInputSchema = z.object({
  roundId: z.string().min(1),

  answers: z
    .array(
      z.object({
        itemId: z.string().min(1),
        value: z.string().nullable().optional(),
      }),
    )
    .default([]),

  moves: z.array(z.tuple([z.number().int().min(0), z.number().int().min(0)])).max(MAX_MOVES).default([]),
  durationSeconds: z.coerce.number().int().min(0).optional().nullable(),
});

export type GameOption = z.infer<typeof GameOptionSchema>;
export type GameItemInput = z.infer<typeof GameItemInputSchema>;
export type CreateGameInput = z.infer<typeof CreateGameInputSchema>;
export type UpdateGameInput = z.infer<typeof UpdateGameInputSchema>;
export type GameSearch = z.infer<typeof GameSearchSchema>;
export type SubmitGameInput = z.infer<typeof SubmitGameInputSchema>;
