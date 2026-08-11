export type GameAnswerResult = {
  itemId: string;
  selected: string | null;
  correctValue: string;
  isCorrect: boolean;
};

export type GameConfig = Record<string, unknown> & {
  itemsPerRound?: number;
  rows?: number;
  cols?: number;
  pairs?: number;
};

export const GAME_SORT_KEYS = ['createdAt', 'updatedAt', 'title', 'order', 'code'] as const;
