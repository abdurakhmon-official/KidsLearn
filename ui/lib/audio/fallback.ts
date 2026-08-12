import type { Locale } from "@/lib/i18n/store";

const VOICE_FALLBACKS: Record<Locale, string[]> = {
  uz: ["uz", "ru", "en"],
  ru: ["ru", "en"],
  en: ["en"],
};

const VOICES_TIMEOUT_MS = 1000;

const MIN_SPEECH_MS = 1500;
const MS_PER_CHAR = 120;
const MAX_SPEECH_MS = 20_000;

let voicesReady: Promise<void> | null = null;

export function isBrowserSpeechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function ensureVoices(): Promise<void> {
  if (window.speechSynthesis.getVoices().length) return Promise.resolve();

  voicesReady ??= new Promise<void>((resolve) => {
    const done = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", done);
      clearTimeout(timer);
      resolve();
    };

    const timer = setTimeout(done, VOICES_TIMEOUT_MS);

    window.speechSynthesis.addEventListener("voiceschanged", done);
  });

  return voicesReady;
}

function pickVoice(locale: Locale) {
  const voices = window.speechSynthesis.getVoices();

  if (!voices.length) return undefined;

  for (const prefix of VOICE_FALLBACKS[locale] ?? VOICE_FALLBACKS.en) {
    const match = voices.find((voice) => voice.lang.toLowerCase().startsWith(prefix));

    if (match) return match;
  }

  return undefined;
}

export async function speakWithBrowser(text: string, locale: Locale): Promise<void> {
  if (!isBrowserSpeechSupported() || !text) return;

  await ensureVoices();

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const voice = pickVoice(locale);

  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  }

  utterance.rate = 0.9;
  utterance.pitch = 1.15;

  // `speak()` is fire-and-forget: without waiting for `end` the next utterance's
  // `cancel()` would cut this one off mid-word.
  await new Promise<void>((resolve) => {
    let settled = false;

    const done = () => {
      if (settled) return;

      settled = true;
      clearTimeout(timer);
      resolve();
    };

    // Some browsers drop `end` (backgrounded tab, cancelled queue) — never hang the sequence.
    const timer = setTimeout(
      done,
      Math.min(MAX_SPEECH_MS, MIN_SPEECH_MS + text.length * MS_PER_CHAR),
    );

    utterance.onend = done;
    utterance.onerror = done;

    window.speechSynthesis.speak(utterance);
  });
}

export function cancelBrowserSpeech() {
  if (isBrowserSpeechSupported()) window.speechSynthesis.cancel();
}
