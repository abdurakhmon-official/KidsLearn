import { getLocale, setLocale as persistLocale } from "@/lib/session";

export const LOCALES = ["uz", "en", "ru"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "uz";

export const LOCALE_LABELS: Record<Locale, string> = {
  uz: "O'zbekcha",
  en: "English",
  ru: "Русский",
};

const isLocale = (value: string | undefined): value is Locale =>
  Boolean(value) && (LOCALES as readonly string[]).includes(value!);

const listeners = new Set<() => void>();

export function subscribeLocale(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getLocaleSnapshot(): Locale {
  const stored = getLocale();
  return isLocale(stored) ? stored : DEFAULT_LOCALE;
}

export function getServerLocaleSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

export function writeLocale(locale: Locale) {
  persistLocale(locale);
  listeners.forEach((listener) => listener());
}
