import { format, formatDistanceToNowStrict, parseISO } from "date-fns";
import { enUS, ru, uz } from "date-fns/locale";
import type { Locale as AppLocale } from "@/lib/i18n/provider";

const DATE_LOCALES = { uz, en: enUS, ru } as const;

export const formatDate = (value: string | Date, locale: AppLocale, pattern = "dd MMM yyyy") => {
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, pattern, { locale: DATE_LOCALES[locale] });
}

export const formatAxisDate = (value: string, locale: AppLocale) => {
  return format(parseISO(value), "dd MMM", { locale: DATE_LOCALES[locale] });
}

export const formatRelative = (value: string, locale: AppLocale) => {
  return formatDistanceToNowStrict(parseISO(value), { addSuffix: true, locale: DATE_LOCALES[locale] });
}

export const monthNames = (locale: AppLocale) =>
  Array.from({ length: 12 }, (_, index) => {
    const name = format(new Date(2000, index, 1), "LLLL", { locale: DATE_LOCALES[locale] });
    return name.charAt(0).toLocaleUpperCase() + name.slice(1);
  });

export const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const axisTickInterval = (days: number) => {
  if (days <= 7) return 0;
  if (days <= 14) return 1;
  return 4;
}
