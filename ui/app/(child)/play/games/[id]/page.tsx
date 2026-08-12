"use client";

import { use } from "react";
import { useGameSession } from "@/components/games/use-game-session";
import { GameShell } from "@/components/games/game-shell";
import { GameResult } from "@/components/games/game-result";
import { ChoiceGame } from "@/components/games/choice-game";
import { PuzzleGame } from "@/components/games/puzzle-game";
import { MemoryGame } from "@/components/games/memory-game";
import { useT } from "@/lib/i18n/provider";
import { CardsSkeleton, EmptyState, ErrorState } from "@/components/shared/states";
import { Skeleton } from "@/components/ui/skeleton";

export default function PlayGamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useT();

  const { round, items, current, index, total, answer, result, restart, isLoading, isError, submitting, refetch } =
    useGameSession(id);

  if (isLoading) return <CardsSkeleton count={2} className="sm:grid-cols-1" />;
  if (isError || !round) return <ErrorState onRetry={refetch} />;
  if (!total) return <EmptyState title={t("game.noContent")} />;

  if (submitting) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="text-6xl" aria-hidden>
          ⏳
        </p>
        <Skeleton className="mx-auto h-8 w-48" />
      </div>
    );
  }

  if (result) return <GameResult result={result} items={items} onRestart={restart} />;
  if (!current) return null;

  return (

    <GameShell title={round.game.title} index={index} total={total}>
      {round.game.code === "PUZZLE" ? (
        <PuzzleGame
          key={current.id}
          item={current}
          config={round.game.config}
          layout={(round.layout as number[] | null) ?? null}
          onAnswer={answer}
        />
      ) : round.game.code === "MEMORY" ? (
        <MemoryGame
          key={current.id}
          item={current}
          layout={(round.layout as string[] | null) ?? null}
          onAnswer={answer}
        />
      ) : (
        <ChoiceGame key={current.id} code={round.game.code} item={current} onAnswer={answer} />
      )}
    </GameShell>
  );
}
