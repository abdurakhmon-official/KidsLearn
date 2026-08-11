import { z } from 'zod';
import { AGE_GROUP } from '@/generated/prisma';

export const ParentDashboardSchema = z.object({
  childId: z.string().optional(),
});

export const LeaderboardSearchSchema = z.object({
  ageGroup: z.nativeEnum(AGE_GROUP).optional(),
  period: z.enum(['week', 'month', 'all']).default('all'),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type ParentDashboardQuery = z.infer<typeof ParentDashboardSchema>;
export type LeaderboardSearch = z.infer<typeof LeaderboardSearchSchema>;
