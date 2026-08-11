import { dateOnly, diffInDays } from '@/utils/date';

export type StreakState = {
  streakDays: number;
  lastActivityAt: Date | null;
};

export const nextStreak = (current: StreakState | null, today: Date): number => {
  if (!current?.lastActivityAt) return 1;

  const lastDay = dateOnly(current.lastActivityAt);
  const gap = diffInDays(lastDay, today);

  if (gap === 0) return Math.max(current.streakDays, 1);
  if (gap === 1) return current.streakDays + 1;

  return 1;
}
