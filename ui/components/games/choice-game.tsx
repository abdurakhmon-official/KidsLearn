"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MicIcon, Volume2Icon } from "lucide-react";
import { useLocale, useT } from "@/lib/i18n/provider";
import { isRecognitionSupported, listenOnce } from "@/lib/speech";
import { useSpeaker } from "@/hooks/use-speaker";
import { cn } from "@/lib/utils";
import type { GameOption, GameType, PlayItem } from "@/types/api";
import { Button } from "@/components/ui/button";

export function ChoiceGame({
  code,
  item,
  onAnswer,
}: {
  code: GameType;
  item: PlayItem;
  onAnswer: (value: string | null) => void;
}) {
  const t = useT();
  const { locale } = useLocale();

  const speaker = useSpeaker();

  const [selected, setSelected] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const stopListening = useRef<() => void>(() => undefined);

  const speakPrompt = useCallback(() => {
    speaker.sayText(item.promptText, item.promptAudio);
  }, [item.promptAudio, item.promptText, speaker]);

  useEffect(() => {
    const timer = setTimeout(speakPrompt, 250);
    return () => clearTimeout(timer);
  }, [speakPrompt]);

  useEffect(() => {
    speaker.prepare([
      { url: item.promptAudio, text: item.promptText },
      ...item.options.map((option) => ({ url: option.audio, text: option.label ?? option.value })),
    ]);
  }, [item.id, item.options, item.promptAudio, item.promptText, speaker]);

  useEffect(() => () => stopListening.current(), []);

  const choose = (value: string) => {
    if (selected) return;

    setSelected(value);

    const option = item.options.find((candidate) => candidate.value === value);

    if (option) speaker.sayText(option.label ?? option.value, option.audio);

    setTimeout(() => onAnswer(value), 450);
  };

  const listen = () => {
    if (listening) {
      stopListening.current();
      setListening(false);
      return;
    }

    setListening(true);

    stopListening.current = listenOnce(
      locale,
      (transcript) => {
        const match = item.options.find((option) =>
          [option.label, option.value].some(
            (candidate) => candidate && transcript.includes(candidate.toLowerCase()),
          ),
        );

        if (match) choose(match.value);
      },
      () => setListening(false),
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center gap-4">
        <Prompt code={code} item={item} />

        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="lg"
            className="h-14 rounded-2xl px-5 text-base"
            onClick={speakPrompt}
          >
            <Volume2Icon data-icon="inline-start" className="size-5" />
            {t("game.listenAgain")}
          </Button>

          {isRecognitionSupported() && (
            <Button
              variant={listening ? "default" : "secondary"}
              size="icon-lg"
              className="size-14 rounded-2xl"
              onClick={listen}
              aria-label={t("game.play")}
              aria-pressed={listening}
            >
              <MicIcon className={cn("size-5", listening && "animate-pulse")} />
            </Button>
          )}
        </div>

      </div>

      <div
        className={cn(
          "grid gap-4",
          item.options.length <= 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3",
        )}
      >
        {item.options.map((option) => (
          <OptionButton
            key={option.value}
            code={code}
            option={option}
            selected={selected === option.value}
            dimmed={Boolean(selected) && selected !== option.value}
            onClick={() => choose(option.value)}
          />
        ))}
      </div>
    </div>
  );
}

function Prompt({ code, item }: { code: GameType; item: PlayItem }) {
  if (code === "ANIMAL_SOUND") {
    return (
      <>
        <span className="text-8xl" aria-hidden>
          🔊
        </span>
        <p className="text-center font-heading text-2xl font-bold text-balance">{item.promptText}</p>
      </>
    );
  }

  if (code === "LETTER_MATCH" || code === "NUMBER_MATCH") {
    return (
      <div className="flex flex-col items-center gap-3">
        <span className="font-heading text-8xl font-bold leading-none md:text-9xl">
          {item.promptText}
        </span>

        {code === "NUMBER_MATCH" && Number(item.promptText) > 0 && Number(item.promptText) <= 10 && (
          <div className="flex flex-wrap justify-center gap-1.5" aria-hidden>
            {Array.from({ length: Number(item.promptText) }).map((_, index) => (
              <span key={index} className="size-4 rounded-full bg-primary" />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <p className="text-center font-heading text-4xl font-bold text-balance md:text-5xl">
      {item.promptText}
    </p>
  );
}

function OptionButton({
  code,
  option,
  selected,
  dimmed,
  onClick,
}: {
  code: GameType;
  option: GameOption;
  selected: boolean;
  dimmed: boolean;
  onClick: () => void;
}) {
  const isColor = code === "COLOR_MATCH" && option.color;
  const isGlyph = code === "LETTER_MATCH" || code === "NUMBER_MATCH";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={option.label ?? option.value}
      aria-pressed={selected}
      className={cn(
        "flex min-h-32 flex-col items-center justify-center gap-2 rounded-[--density-radius] bg-card p-5 ring-4 transition-all",
        "focus-visible:outline-none focus-visible:ring-8 active:scale-95",
        selected ? "scale-105 ring-primary" : "ring-border hover:ring-primary/50",
        dimmed && "opacity-40",
      )}
    >
      {isColor ? (
        <span
          className="size-20 rounded-full ring-2 ring-black/10"
          style={{ backgroundColor: option.color! }}
          aria-hidden
        />
      ) : option.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={option.image} alt="" className="size-20 rounded-xl object-cover" />
      ) : isGlyph ? (
        <span className="font-heading text-6xl font-bold leading-none">{option.label ?? option.value}</span>
      ) : (
        <span className="text-5xl" aria-hidden>
          {ANIMAL_EMOJI[option.value] ?? "❓"}
        </span>
      )}

      {!isGlyph && option.label && <span className="text-lg font-semibold">{option.label}</span>}
    </button>
  );
}

const ANIMAL_EMOJI: Record<string, string> = {
  cat: "🐱",
  dog: "🐶",
  cow: "🐮",
  sheep: "🐑",
  horse: "🐴",
  duck: "🦆",
  chicken: "🐔",
  pig: "🐷",
  lion: "🦁",
  bear: "🐻",
};
