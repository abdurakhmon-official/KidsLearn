import { z } from 'zod';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/utils/constants';

export const SortingSchema = z.object({
  key: z.string(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const BasicSearchSchema = z
  .object({
    size: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).nullable().default(DEFAULT_PAGE_SIZE),
    page: z.coerce.number().int().min(1).nullable().default(1),
    search: z.string().max(200).optional().nullable(),
    sortBy: z.array(SortingSchema).max(5).default([
      {
        key: 'createdAt',
        order: 'desc',
      },
    ]),
  })
  .transform(({ search, size, page, sortBy }) => {
    size = size || DEFAULT_PAGE_SIZE;
    page = page || 1;

    return { search, size, page, skip: (page - 1) * size, sortBy };
  });

export type BasicSearch = z.infer<typeof BasicSearchSchema>;
export type Sorting = z.infer<typeof SortingSchema>;
