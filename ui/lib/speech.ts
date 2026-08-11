const LOCALE_FALLBACKS: Record<string, string[]> = {
  uz: ["uz", "ru", "en"],
  ru: ["ru", "en"],
  en: ["en"],
};

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function pickVoice(locale: string): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return undefined;

  for (const prefix of LOCALE_FALLBACKS[locale] ?? ["en"]) {
    const match = voices.find((voice) => voice.lang.toLowerCase().startsWith(prefix));
    if (match) return match;
  }

  return undefined;
}

export function speak(text: string, locale = "uz") {
  if (!isSpeechSupported() || !text.trim()) return;

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

export function stopSpeaking() {
  if (isSpeechSupported()) window.speechSynthesis.cancel();
}

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function recognitionCtor(): SpeechRecognitionCtor | undefined {
  if (typeof window === "undefined") return undefined;

  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };

  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export function isRecognitionSupported(): boolean {
  return Boolean(recognitionCtor());
}

const RECOGNITION_LANG: Record<string, string> = { uz: "ru-RU", ru: "ru-RU", en: "en-US" };

export function listenOnce(
  locale: string,
  onResult: (transcript: string) => void,
  onEnd?: () => void,
): () => void {
  const Ctor = recognitionCtor();

  if (!Ctor) {
    onEnd?.();
    return () => undefined;
  }

  const recognition = new Ctor();
  recognition.lang = RECOGNITION_LANG[locale] ?? "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const transcript = event.results?.[0]?.[0]?.transcript;
    if (transcript) onResult(transcript.trim().toLowerCase());
  };

  recognition.onerror = () => onEnd?.();
  recognition.onend = () => onEnd?.();

  recognition.start();

  return () => recognition.stop();
}
