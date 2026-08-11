export const DEFAULT_PAGE_SIZE = 10;

export const MAX_PAGE_SIZE = 100;

export const BCRYPT_SALT_ROUNDS = 10;

export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

export const GLOBAL_RATE_LIMIT = 300;

export const AUTH_RATE_LIMIT = 10;

export const STAR_THRESHOLDS = [
  { percent: 90, stars: 3 },
  { percent: 70, stars: 2 },
  { percent: 40, stars: 1 },
];

export const WEEKLY_RANGE_DAYS = 7;
export const MONTHLY_RANGE_DAYS = 30;

export const ADMIN_CHART_RANGE_DAYS = 14;

export const TOP_SUBJECTS_LIMIT = 3;

export const CATEGORY_CACHE_TTL_MS = 5 * 60 * 1000;

export const CACHE_MAX_ENTRIES = 500;
