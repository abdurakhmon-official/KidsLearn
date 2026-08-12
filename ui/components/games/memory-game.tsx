"use client";

import { useRef, useState } from "react";
import { FlagIcon } from "lucide-react";
import { useT } from "@/lib/i18n/provider";
import { useSpeaker } from "@/hooks/use-speaker";
import { cn } from "@/lib/utils";
import type { GameMove, PlayItem } from "@/types/api";
import { Button } from "@/components/ui/button";

const FLIP_BACK_MS = 800;

type Card = { id: number; face: string; matched: boolean };

export function MemoryGame({
  item,
  layout,
  onAnswer,
}: {
  item: PlayItem;

  layout: string[] | null;
  onAnswer: (value: string | null, moves: GameMove[]) => void;
}) {
  const t = useT();
  const speaker = useSpeaker();

  const [cards, setCards] = useState<Card[]>(() =>
    (layout ?? []).map((face, index) => ({ id: index, face, matched: false })),
  );

  const [flipped, setFlipped] = useState<number[]>([]);
  const [moveCount, setMoveCount] = useState(0);
  const [locked, setLocked] = useState(false);
  const [solved, setSolved] = useState(false);

  const moves = useRef<GameMove[]>([]);

  const flip = (index: number) => {
    if (locked || solved) return;
    if (flipped.includes(index) || cards[index].matched) return;

    const next = [...flipped, index];
    setFlipped(next);

    if (next.length < 2) return;

    setMoveCount((count) => count + 1);
    setLocked(true);

    const [first, second] = next;

    moves.current.push([first, second]);

    if (cards[first].face === cards[second].face) {
      const updated = cards.map((card, position) =>
        position === first || position === second ? { ...card, matched: true } : card,
      );

      setCards(updated);
      setFlipped([]);
      setLocked(false);

      if (updated.every((card) => card.matched)) {
        setSolved(true);
        speaker.sayKey("game.resultTitle");

        setTimeout(() => onAnswer(item.options[0]?.value ?? null, moves.current), 900);
      }

      return;
    }

    setTimeout(() => {
      setFlipped([]);
      setLocked(false);
    }, FLIP_BACK_MS);
  };

  return (
    <div className="space-y-6">
      <p className="text-center text-lg tabular-nums text-muted-foreground">
        {t("game.memoryMoves", { moves: moveCount })}
      </p>

      <div className="mx-auto grid w-full max-w-md grid-cols-3 gap-3 sm:grid-cols-4">
        {cards.map((card, index) => {
          const open = flipped.includes(index) || card.matched;

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => flip(index)}
              disabled={card.matched || solved}
              aria-label={open ? card.face : t("game.play")}
              className={cn(
                "flex aspect-square items-center justify-center rounded-2xl text-4xl transition-all",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring active:scale-95",
                open
                  ? card.matched
                    ? "bg-success/15 ring-4 ring-success/50"
                    : "bg-card ring-4 ring-primary"
                  : "bg-primary/90 ring-2 ring-primary hover:bg-primary",
              )}
            >
              <span aria-hidden>{open ? card.face : "❔"}</span>
            </button>
          );
        })}
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
