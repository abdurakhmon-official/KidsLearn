"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FlagIcon } from "lucide-react";
import { useT } from "@/lib/i18n/provider";
import { useSpeaker } from "@/hooks/use-speaker";
import { cn } from "@/lib/utils";
import type { GameConfig, GameMove, PlayItem } from "@/types/api";
import { Button } from "@/components/ui/button";

export function PuzzleGame({
  item,
  config,
  layout,
  onAnswer,
}: {
  item: PlayItem;
  config: GameConfig | null;

  layout: number[] | null;
  onAnswer: (value: string | null, moves: GameMove[]) => void;
}) {
  const t = useT();
  const speaker = useSpeaker();

  const rows = Math.max(2, Math.min(5, Number(config?.rows) || 3));
  const cols = Math.max(2, Math.min(5, Number(config?.cols) || 3));
  const count = rows * cols;

  const [order, setOrder] = useState<number[]>(
    () => layout ?? Array.from({ length: count }, (_, index) => index),
  );

  const [picked, setPicked] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);

  const moves = useRef<GameMove[]>([]);

  useEffect(() => {
    speaker.sayKey("game.puzzleHint");
  }, [speaker]);

  const swap = (position: number) => {
    if (solved) return;

    if (picked === null) {
      setPicked(position);
      return;
    }

    if (picked === position) {
      setPicked(null);
      return;
    }

    const next = [...order];
    [next[picked], next[position]] = [next[position], next[picked]];

    moves.current.push([picked, position]);

    setOrder(next);
    setPicked(null);

    if (next.every((value, index) => value === index)) {
      setSolved(true);
      speaker.sayKey("game.resultTitle");

      setTimeout(() => onAnswer(item.options[0]?.value ?? null, moves.current), 900);
    }
  };

  const tileStyle = useMemo(() => {
    return (piece: number): React.CSSProperties => {
      const row = Math.floor(piece / cols);
      const column = piece % cols;

      if (item.promptImage) {
        return {
          backgroundImage: `url(${item.promptImage})`,
          backgroundSize: `${cols * 100}% ${rows * 100}%`,
          backgroundPosition: `${(column / (cols - 1)) * 100}% ${(row / (rows - 1)) * 100}%`,
        };
      }

      const hue = Math.round((piece / count) * 300);
      return { background: `linear-gradient(135deg, oklch(0.7 0.15 ${hue}), oklch(0.55 0.18 ${hue + 30}))` };
    };
  }, [cols, rows, count, item.promptImage]);

  return (
    <div className="space-y-6">
      <p className="text-center text-lg text-muted-foreground">{t("game.puzzleHint")}</p>

      <div
        className={cn(
          "mx-auto grid w-full max-w-md gap-1.5 rounded-[--density-radius] bg-card p-2 ring-2 transition-all",
          solved ? "ring-success" : "ring-border",
        )}
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {order.map((piece, position) => (
          <button
            key={position}
            type="button"
            onClick={() => swap(position)}
            disabled={solved}
            aria-label={`${position + 1}-katak`}
            aria-pressed={picked === position}
            className={cn(
              "aspect-square rounded-xl bg-cover transition-transform",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring",
              picked === position && "scale-95 ring-4 ring-primary",
              !solved && "active:scale-95",
            )}
            style={tileStyle(piece)}
          />
        ))}
      </div>

      {solved ? (
        <p className="text-center font-heading text-2xl font-bold text-success">🎉 {t("game.resultTitle")}</p>
      ) : (
        <Button
          variant="outline"
          size="lg"
          className="h-14 w-full text-lg"

          onClick={() => onAnswer(null, moves.current)}
        >
          <FlagIcon data-icon="inline-start" />
          {t("game.giveUp")}
        </Button>
      )}
    </div>
  );
}
