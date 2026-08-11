import { NOTIFICATION_TYPE, Prisma } from '@/generated/prisma';

/** Yozilishidan oldingi bildirishnoma — `NotificationService.push()` shuni oladi. */
export type NotificationDraft = {
  userId: string;
  childId?: string | null;
  type: NOTIFICATION_TYPE;
  title: string;
  body: string;
  data?: Prisma.InputJsonValue;
};

/** Medal haqida xabar yozish uchun yetarli ma'lumot. */
export type NotifiableAward = {
  code: string;
  title: string;
  medal: string;
  icon?: string | null;
};

/** `sortBy` da ruxsat etilgan ustunlar. */
export const NOTIFICATION_SORT_KEYS = ['createdAt', 'readAt', 'type'] as const;
