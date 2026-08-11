import { Sorting } from '@/inputs/basic.search';

export type SortOrder = 'asc' | 'desc';
export const DEFAULT_SORTING: Record<string, SortOrder> = { createdAt: 'desc' };

export const buildSorting = (
  sortBy: Sorting[],
  allowed: readonly string[],
  fallback: Record<string, SortOrder> = DEFAULT_SORTING,
): Record<string, SortOrder> => {
  const sorting: Record<string, SortOrder> = {};

  for (const { key, order } of sortBy) {
    if (allowed.includes(key)) {
      sorting[key] = order;
    }
  }

  return Object.keys(sorting).length ? sorting : fallback;
}
