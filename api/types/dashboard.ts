import type { categoryPerformance } from '../generated/prisma/sql';

export type CategoryPerformanceRow = categoryPerformance.Result;

export type CategoryPerformance = Omit<CategoryPerformanceRow, 'correct' | 'total' | 'sessions'> & {
  correct: number;
  total: number;
  sessions: number;
  accuracy: number;
};

export type DailyActivityRow = {
  date: Date;
  points: number;
  gamesPlayed: number;
  lessonsCompleted: number;
  activeSeconds: number;
};

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
