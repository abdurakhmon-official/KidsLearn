import type { TranslationKey } from "@/lib/i18n/dictionaries/uz";

export const SPOKEN_PHRASE_KEYS = [
  "play.greeting",
  "lesson.title",
  "game.title",
  "progress.title",
  "game.resultTitle",
  "game.puzzleHint",
  "award.newAward",
] as const satisfies readonly TranslationKey[];

export type SpokenPhraseKey = (typeof SPOKEN_PHRASE_KEYS)[number];
