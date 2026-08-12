import type { Locale } from "@/lib/i18n/store";
import {
  cachedPhraseUrl,
  cachedTtsUrl,
  loadPhraseAudio,
  normalizeText,
  resolveTtsUrl,
  resolveTtsUrls,
} from "./client";
import { cancelBrowserSpeech, speakWithBrowser } from "./fallback";
import { effect, preloadAll, stopAll as stopPlayers, voice } from "./player";

export { enableAudioOnFirstGesture, isAudioUnlocked, preload, preloadAll } from "./player";
export { isTtsAvailable } from "./client";


export type Utterance = {
  url?: string | null;
  text?: string | null;
  phraseKey?: string | null;
};

type Channel = "voice" | "effect";

async function resolveUrl(utterance: Utterance, locale: Locale): Promise<string | null> {
  if (utterance.url) return utterance.url;

  if (utterance.phraseKey) {
    const recorded = cachedPhraseUrl(utterance.phraseKey, locale);

    if (recorded) return recorded;
  }

  const text = normalizeText(utterance.text);

  if (!text) return null;

  return cachedTtsUrl(text, locale) ?? (await resolveTtsUrl(text, locale));
}

let epoch = 0;

export async function say(
  utterance: Utterance,
  locale: Locale,
  channel: Channel = "voice",
): Promise<void> {
  const url = await resolveUrl(utterance, locale);
  const text = normalizeText(utterance.text);

  if (!url) {
    if (channel === "voice") await speakWithBrowser(text, locale);

    return;
  }

  if (channel === "voice") cancelBrowserSpeech();

  const played = await (channel === "effect" ? effect : voice).play(url);

  // Yozib olingan fayl ijro etilmasa (autoplay bloki, fayl yo'q) — jim qolmaymiz.
  if (!played && channel === "voice") await speakWithBrowser(text, locale);
}

export async function saySequence(utterances: Utterance[], locale: Locale): Promise<void> {
  const current = epoch;

  for (const utterance of utterances) {
    await say(utterance, locale);

    if (current !== epoch) return;
  }
}

export function stopAll() {
  epoch += 1;

  stopPlayers();
  cancelBrowserSpeech();
}

export function stopSpeaking() {
  stopAll();
}

export async function prepare(utterances: Utterance[], locale: Locale): Promise<void> {
  const direct = utterances.map((item) => item.url).filter(Boolean) as string[];

  preloadAll(direct);

  const texts = utterances
    .filter((item) => !item.url && !(item.phraseKey && cachedPhraseUrl(item.phraseKey, locale)))
    .map((item) => item.text);

  await resolveTtsUrls(texts, locale);

  preloadAll(texts.map((text) => cachedTtsUrl(text, locale)));
}

export async function loadPhrases(locale: Locale) {
  return await loadPhraseAudio(locale);
}
