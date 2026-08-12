import { NOTIFICATION_TYPE, Prisma } from '@/generated/prisma';

export type NotificationDraft = {
  userId: string;
  childId?: string | null;
  type: NOTIFICATION_TYPE;
  title: string;
  body: string;
  data?: Prisma.InputJsonValue;
};

export type NotifiableAward = {
  code: string;
  title: string;
  medal: string;
  icon?: string | null;
};

export const NOTIFICATION_SORT_KEYS = ['createdAt', 'readAt', 'type'] as const;
