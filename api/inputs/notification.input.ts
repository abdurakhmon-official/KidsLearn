import { z } from 'zod';
import { NOTIFICATION_TYPE } from '@/generated/prisma';

export const NotificationSearchSchema = z.object({
  type: z.nativeEnum(NOTIFICATION_TYPE).optional(),
  unreadOnly: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform(value => value === true || value === 'true')
    .optional(),
  childId: z.string().optional(),
});

export type NotificationSearch = z.infer<typeof NotificationSearchSchema>;
