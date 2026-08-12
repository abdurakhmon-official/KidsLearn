import type { Locale } from "@/lib/i18n/store";

const VOICE_FALLBACKS: Record<Locale, string[]> = {
  uz: ["uz", "ru", "en"],
  ru: ["ru", "en"],
  en: ["en"],
};

export function isBrowserSpeechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
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

export function speakWithBrowser(text: string, locale: Locale) {
  if (!isBrowserSpeechSupported() || !text) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const voice = pickVoice(locale);

  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  }

  utterance.rate = 0.9;
  utterance.pitch = 1.15;

  window.speechSynthesis.speak(utterance);
}

export function cancelBrowserSpeech() {
  if (isBrowserSpeechSupported()) window.speechSynthesis.cancel();
}
