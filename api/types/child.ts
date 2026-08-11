import { AGE_GROUP } from '@/generated/prisma';

export type WithAge<T> = T & {
  age: number;
  ageGroup: AGE_GROUP;
};

export const CHILD_SORT_KEYS = ['createdAt', 'updatedAt', 'fullName', 'birthDate'] as const;
