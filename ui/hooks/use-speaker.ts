"use client";

import { useEffect, useMemo } from "react";
import { useLocale, useT } from "@/lib/i18n/provider";
import type { TranslationKey } from "@/lib/i18n/dictionaries/uz";
import { loadPhrases, prepare, say, saySequence, stopSpeaking, type Utterance } from "@/lib/audio";

export function useSpeaker() {
  const { locale } = useLocale();
  const t = useT();

  useEffect(() => {
    void loadPhrases(locale);
  }, [locale]);

  return useMemo(
    () => ({
      locale,

      say: (utterance: Utterance) => void say(utterance, locale),

      sayText: (text: string | null | undefined, url?: string | null) =>
        void say({ url, text }, locale),

      sayAll: (utterances: Utterance[]) => void saySequence(utterances, locale),

      sayKey: (key: TranslationKey, values?: Record<string, string | number>) =>
        void say({ phraseKey: values ? null : key, text: t(key, values) }, locale),

      playEffect: (url: string | null | undefined) => void say({ url }, locale, "effect"),

      prepare: (utterances: Utterance[]) => void prepare(utterances, locale),
      
      stop: stopSpeaking,
    }),
    [locale, t],
  );
}
