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
