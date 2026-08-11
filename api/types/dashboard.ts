import type { categoryPerformance } from '@/generated/prisma/sql';

/**
 * `prisma/sql/categoryPerformance.sql` natijasi — tip qo'lda yozilmaydi,
 * `prisma generate --sql` uni bazadan chiqaradi. Agregatlar (`correct`,
 * `total`, `sessions`) SQL bo'yicha `null` bo'lishi mumkin.
 */
export type CategoryPerformanceRow = categoryPerformance.Result;

/**
 * Normalizatsiya qilingan hol — "eng yaxshi fanlar" va "qiyin mavzular" shu
 * tipda qaytadi: agregatlar `0` ga tushirilgan, aniqlik foizi qo'shilgan.
 */
export type CategoryPerformance = Omit<CategoryPerformanceRow, 'correct' | 'total' | 'sessions'> & {
  correct: number;
  total: number;
  sessions: number;
  accuracy: number;
};

/** Grafik qurish uchun `DailyActivity` dan o'qiladigan maydonlar. */
export type DailyActivityRow = {
  date: Date;
  points: number;
  gamesPlayed: number;
  lessonsCompleted: number;
  activeSeconds: number;
};

/** Ota-ona grafigidagi bitta kun. */
export type ChartDay = {
  date: string;
  points: number;
  gamesPlayed: number;
  lessonsCompleted: number;
  activeMinutes: number;
};

export type ChartTotals = Omit<ChartDay, 'date'>;

export type ActivityChart = {
  days: ChartDay[];
  totals: ChartTotals;
};

export type AdminChartDay = {
  date: string;
  points: number;
  gamesPlayed: number;
  lessonsCompleted: number;
};
