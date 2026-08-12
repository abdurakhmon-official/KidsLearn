import type { AxiosError } from "axios";
import api from "@/lib/axios";
import type { Locale } from "@/lib/i18n/store";

type SpeakResponse = { url: string; cached: boolean; durationMs: number | null };
type BatchResponse = { items: Record<string, string>; enabled: boolean };
type PhrasesResponse = { locale: string; items: Record<string, string> };

const BATCH_LIMIT = 40;

const urls = new Map<string, string>();
const inFlight = new Map<string, Promise<string | null>>();
const phrases = new Map<Locale, Record<string, string>>();
const phrasesInFlight = new Map<Locale, Promise<Record<string, string>>>();

let available = true;
let failures = 0;
let pausedUntil = 0;

const FAILURE_LIMIT = 3;

const COOLDOWN_MS = 2 * 60 * 1000;

function noteFailure(error: unknown) {
  const status = (error as AxiosError)?.response?.status;

  if (status === 400) {
    available = false;
    return;
  }

  failures += 1;

  if (failures >= FAILURE_LIMIT) {
    pausedUntil = Date.now() + COOLDOWN_MS;
    failures = 0;
  }
}

function noteSuccess() {
  failures = 0;
  pausedUntil = 0;
}

function canRequest() {
  return available && Date.now() >= pausedUntil;
}

const cacheKey = (text: string, locale: Locale) => `${locale}|${text}`;

export function normalizeText(text: string | null | undefined) {
  return (text ?? "").replace(/\s+/g, " ").trim();
}

export function isTtsAvailable() {
  return canRequest();
}

export function cachedTtsUrl(text: string | null | undefined, locale: Locale) {
  const normalized = normalizeText(text);

  return normalized ? (urls.get(cacheKey(normalized, locale)) ?? null) : null;
}

export async function resolveTtsUrl(
  text: string | null | undefined,
  locale: Locale,
): Promise<string | null> {
  const normalized = normalizeText(text);

  if (!normalized || !canRequest()) return null;

  const key = cacheKey(normalized, locale);
  const cached = urls.get(key);

  if (cached) return cached;

  const pending = inFlight.get(key);

  if (pending) return await pending;

  const request = api
    .get<{ data: SpeakResponse }>("/audio/speak", {
      params: { text: normalized, locale },
      silent: true,
    })
    .then((response) => {
      const url = response.data?.data?.url ?? null;

      if (url) {
        urls.set(key, url);
        noteSuccess();
      }

      return url;
    })
    .catch((error) => {
      noteFailure(error);
      return null;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, request);

  return await request;
}

export async function resolveTtsUrls(texts: (string | null | undefined)[], locale: Locale) {
  if (!canRequest()) return;

  const wanted = [
    ...new Set(
      texts
        .map(normalizeText)
        .filter((text) => text && !urls.has(cacheKey(text, locale))),
    ),
  ];

  if (!wanted.length) return;

  for (let index = 0; index < wanted.length; index += BATCH_LIMIT) {
    const chunk = wanted.slice(index, index + BATCH_LIMIT);

    try {
      const response = await api.post<{ data: BatchResponse }>(
        "/audio/speak/batch",
        { locale, texts: chunk },
        { silent: true },
      );

      const data = response.data?.data;

      if (!data?.enabled) {
        available = false;
        return;
      }

      for (const [text, url] of Object.entries(data.items ?? {})) {
        urls.set(cacheKey(text, locale), url);
      }

      noteSuccess();
    } catch (error) {
      noteFailure(error);
      return;
    }
  }
}

export async function loadPhraseAudio(locale: Locale): Promise<Record<string, string>> {
  const cached = phrases.get(locale);

  if (cached) return cached;

  const pending = phrasesInFlight.get(locale);

  if (pending) return await pending;

  const request = api
    .get<{ data: PhrasesResponse }>("/audio/phrases", { params: { locale }, silent: true })
    .then((response) => {
      const items = response.data?.data?.items ?? {};

      phrases.set(locale, items);

      return items;
    })
    .catch(() => {
      phrases.set(locale, {});
      return {};
    })
    .finally(() => {
      phrasesInFlight.delete(locale);
    });

  phrasesInFlight.set(locale, request);

  return await request;
}

export function cachedPhraseUrl(key: string, locale: Locale) {
  return phrases.get(locale)?.[key] ?? null;
}
