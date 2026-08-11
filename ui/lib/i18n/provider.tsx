"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { uz, type Dictionary, type TranslationKey } from "./dictionaries/uz";
import { en } from "./dictionaries/en";
import { ru } from "./dictionaries/ru";
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_LABELS,
  getLocaleSnapshot,
  getServerLocaleSnapshot,
  subscribeLocale,
  writeLocale,
  type Locale,
} from "./store";

export { LOCALES, LOCALE_LABELS, DEFAULT_LOCALE };
export type { Locale };

const DICTIONARIES: Record<Locale, Dictionary> = { uz, en, ru };

export type Translate = (key: TranslationKey, values?: Record<string, string | number>) => string;

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translate;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

/** `{name}` shaklidagi joy egallovchilarni almashtiradi. */
function interpolate(template: string, values?: Record<string, string | number>) {
  if (!values) return template;

  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribeLocale, getLocaleSnapshot, getServerLocaleSnapshot);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => writeLocale(next), []);

  const t = useCallback<Translate>(
    (key, values) => interpolate(DICTIONARIES[locale][key] ?? uz[key] ?? key, values),
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

function useLocaleContext() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useT must be used inside <LocaleProvider>");
  }

  return context;
}

export function useT(): Translate {
  return useLocaleContext().t;
}

export function useLocale() {
  const { locale, setLocale } = useLocaleContext();
  return { locale, setLocale };
}
