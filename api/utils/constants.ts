export const DEFAULT_PAGE_SIZE = 10;

export const MAX_PAGE_SIZE = 100;

export const BCRYPT_SALT_ROUNDS = 10;

export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

export const GLOBAL_RATE_LIMIT = 300;

export const AUTH_RATE_LIMIT = 10;
export const AUDIO_RATE_LIMIT = 150;

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

export const DEFAULT_CATEGORY_ICON = '📚';
export const DEFAULT_CATEGORY_COLOR = '#6d51ec';

export const CACHE_MAX_ENTRIES = 500;

export const UPLOAD_FOLDERS = ['games', 'lessons', 'categories', 'phrases', 'avatars'] as const;

export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export const TTS_FOLDER = 'tts';

export const READABLE_ASSET_FOLDERS = [...UPLOAD_FOLDERS, TTS_FOLDER] as const;

export type ReadableAssetFolder = (typeof READABLE_ASSET_FOLDERS)[number];

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export const UPLOAD_MIME_TYPES: Record<string, 'IMAGE' | 'VIDEO' | 'AUDIO'> = {
  'image/png': 'IMAGE',
  'image/jpeg': 'IMAGE',
  'image/webp': 'IMAGE',
  'image/gif': 'IMAGE',
  'image/svg+xml': 'IMAGE',
  'video/mp4': 'VIDEO',
  'video/webm': 'VIDEO',
  'audio/mpeg': 'AUDIO',
  'audio/mp3': 'AUDIO',
  'audio/wav': 'AUDIO',
  'audio/x-wav': 'AUDIO',
  'audio/ogg': 'AUDIO',
  'audio/webm': 'AUDIO',
  'audio/mp4': 'AUDIO',
  'audio/aac': 'AUDIO',
};
