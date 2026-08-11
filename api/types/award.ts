import { MEDAL_TYPE } from '@/generated/prisma';

/** Medal qoidalari tekshiradigan ko'rsatkichlar. */
export type AwardStats = {
  totalPoints: number;
  totalStars: number;
  gamesPlayed: number;
  lessonsCompleted: number;
  streakDays: number;
};

export type AwardContext = {
  stats: AwardStats;
  /** Faqat hozirgina yakunlangan o'yin 100% to'g'ri bo'lsa. */
  perfectGame?: boolean;
};

/** Beriladigan medal — `awards` jadvaliga shu shaklda yoziladi. */
export type AwardDraft = {
  code: string;
  medal: MEDAL_TYPE;
  title: string;
  description: string;
  icon: string;
};

/** Medal + uni qachon berish shartini aniqlaydigan funksiya. */
export type AwardRule = AwardDraft & {
  check: (context: AwardContext) => boolean;
};
