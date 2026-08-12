const SILENCE = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YQAAAAA=";

const MAX_PRELOADED = 60;

const preloaded = new Map<string, HTMLAudioElement>();

let unlocked = false;
let listening = false;

class Channel {
  private element: HTMLAudioElement | null = null;

  private token = 0;

  private get audio() {
    if (typeof window === "undefined") return null;

    if (!this.element) {
      this.element = new Audio();
      this.element.preload = "auto";
    }

    return this.element;
  }

  play(url: string): Promise<void> {
    const audio = this.audio;

    if (!audio || !url) return Promise.resolve();

    const token = ++this.token;

    audio.pause();
    audio.src = url;
    audio.currentTime = 0;

    return new Promise<void>((resolve) => {
      const done = () => {
        audio.removeEventListener("ended", done);
        audio.removeEventListener("error", done);

        if (token === this.token) resolve();
      };

      audio.addEventListener("ended", done);
      audio.addEventListener("error", done);

      audio.play().catch(() => done());
    });
  }

  stop() {
    this.token += 1;

    if (this.element) {
      this.element.pause();
      this.element.currentTime = 0;
    }
  }

  unlock() {
    const audio = this.audio;

    if (!audio) return;

    audio.src = SILENCE;
    audio.play().then(() => audio.pause()).catch(() => undefined);
  }
}

export const voice = new Channel();

export const effect = new Channel();

export function enableAudioOnFirstGesture() {
  if (typeof window === "undefined" || listening || unlocked) return;

  listening = true;

  const unlock = () => {
    if (unlocked) return;

    unlocked = true;
    voice.unlock();
    effect.unlock();

    for (const event of ["pointerdown", "touchend", "keydown"]) {
      window.removeEventListener(event, unlock);
    }
  };

  for (const event of ["pointerdown", "touchend", "keydown"]) {
    window.addEventListener(event, unlock, { passive: true });
  }
}

export function isAudioUnlocked() {
  return unlocked;
}

export function preload(url: string | null | undefined) {
  if (typeof window === "undefined" || !url || preloaded.has(url)) return;

  const audio = new Audio();
  audio.preload = "auto";
  audio.src = url;
  audio.load();

  preloaded.set(url, audio);

  if (preloaded.size > MAX_PRELOADED) {
    const oldest = preloaded.keys().next().value;
    if (oldest) preloaded.delete(oldest);
  }
}

export function preloadAll(urls: (string | null | undefined)[]) {
  for (const url of urls) preload(url);
}

export function stopAll() {
  voice.stop();
  effect.stop();
}
