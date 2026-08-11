"use client";

import { useState } from "react";
import { FlagIcon } from "lucide-react";
import { useLocale, useT } from "@/lib/i18n/provider";
import { speak } from "@/lib/speech";
import { cn } from "@/lib/utils";
import type { GameConfig, PlayItem } from "@/types/api";
import { Button } from "@/components/ui/button";

/** Kartochka mazmuni `options` dan olinadi; yetmasa shu to'plamdan to'ldiriladi. */
const FALLBACK_FACES = ["🍎", "🐻", "⭐", "🚗", "🌸", "🐟", "🎈", "🍌", "🦋", "🌙", "🍇", "🐸"];

const FLIP_BACK_MS = 800;

type Card = { id: number; face: string; matched: boolean };

export function MemoryGame({
  item,
  config,
  onAnswer,
}: {
  item: PlayItem;
  config: GameConfig | null;
  onAnswer: (value: string | null) => void;
}) {
  const t = useT();
  const { locale } = useLocale();

  const pairs = Math.max(2, Math.min(8, Number(config?.pairs) || 6));

  // Lazy initializer — komponent har savolda `key` bilan qayta yaratiladi,
  // shuning uchun effekt ichida qayta tiklash kerak emas.
  const [cards, setCards] = useState<Card[]>(() => {
    const optionFaces = item.options
      .map((option) => option.label ?? option.image ?? "")
      .filter((face) => face && face.length <= 4);

    const faces = [...optionFaces, ...FALLBACK_FACES].slice(0, pairs);

    return faces
      .flatMap((face, index) => [
        { id: index * 2, face, matched: false },
        { id: index * 2 + 1, face, matched: false },
      ])
      .sort(() => Math.random() - 0.5);
  });

  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [solved, setSolved] = useState(false);

  const flip = (index: number) => {
    if (locked || solved) return;
    if (flipped.includes(index) || cards[index].matched) return;

    const next = [...flipped, index];
    setFlipped(next);

    if (next.length < 2) return;

    setMoves((count) => count + 1);
    setLocked(true);

    const [first, second] = next;

    if (cards[first].face === cards[second].face) {
      const updated = cards.map((card, position) =>
        position === first || position === second ? { ...card, matched: true } : card,
      );

      setCards(updated);
      setFlipped([]);
      setLocked(false);

      if (updated.every((card) => card.matched)) {
        setSolved(true);
        speak(t("game.resultTitle"), locale);
        // `options` dagi yagona qiymat — "hammasi topildi" holati.
        setTimeout(() => onAnswer(item.options[0]?.value ?? null), 900);
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
        {t("game.memoryMoves", { moves })}
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
        <Button variant="outline" size="lg" className="h-14 w-full text-lg" onClick={() => onAnswer(null)}>
          <FlagIcon data-icon="inline-start" />
          {t("game.giveUp")}
        </Button>
      )}
    </div>
  );
}
