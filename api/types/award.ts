import { MEDAL_TYPE } from '@/generated/prisma';

export type AwardStats = {
  totalPoints: number;
  totalStars: number;
  gamesPlayed: number;
  lessonsCompleted: number;
  streakDays: number;
};

export type AwardContext = {
  stats: AwardStats;

  perfectGame?: boolean;
};

export type AwardDraft = {
  code: string;
  medal: MEDAL_TYPE;
  title: string;
  description: string;
  icon: string;
};

export type AwardRule = AwardDraft & {
  check: (context: AwardContext) => boolean;
};
