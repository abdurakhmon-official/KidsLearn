"use client";

import Link from "next/link";
import { useGamesForChildQuery } from "@/store/api/game-api";
import { useLocale, useT } from "@/lib/i18n/provider";
import { speak } from "@/lib/speech";
import type { GameType } from "@/types/api";
import { Stars } from "@/components/shared/badges";
import { CardsSkeleton, EmptyState, ErrorState } from "@/components/shared/states";

/** Har bir o'yin turining emoji belgisi — seed'da muqova rasmi yo'q. */
const GAME_EMOJI: Record<GameType, string> = {
  COLOR_MATCH: "🎨",
  ANIMAL_SOUND: "🐻",
  LETTER_MATCH: "🔤",
  NUMBER_MATCH: "🔢",
  PUZZLE: "🧩",
  MEMORY: "🃏",
};

export default function ChildGamesPage() {
  const t = useT();
  const { locale } = useLocale();
  const { data, isLoading, isError, refetch } = useGamesForChildQuery();

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-bold md:text-4xl">🎮 {t("game.title")}</h1>

      {isLoading && <CardsSkeleton count={4} />}
      {isError && <ErrorState onRetry={refetch} />}
      {data?.items.length === 0 && <EmptyState title={t("game.empty")} />}

      {data && data.items.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((game) => {
            const playable = game._count.items > 0;

            return (
              <Link
                key={game.id}
                href={playable ? `/play/games/${game.id}` : "#"}
                aria-disabled={!playable}
                onClick={(event) => {
                  if (!playable) {
                    event.preventDefault();
                    return;
                  }
                  speak(game.title, locale);
                }}
                className={`flex flex-col gap-3 rounded-[--density-radius] bg-card p-5 ring-2 ring-border transition-transform focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring ${
                  playable ? "hover:ring-primary active:scale-95" : "pointer-events-none opacity-50"
                }`}
              >
                <span
                  className="flex h-28 items-center justify-center rounded-xl text-7xl"
                  style={{
                    backgroundColor: `color-mix(in oklch, ${game.category?.color ?? "var(--muted)"} 15%, transparent)`,
                  }}
                  aria-hidden
                >
                  {GAME_EMOJI[game.code]}
                </span>

                <div className="space-y-1">
                  <p className="font-heading text-lg font-bold leading-tight">{game.title}</p>
                  <p className="text-sm text-muted-foreground">{t(`game.type.${game.code}`)}</p>
                </div>

                {playable ? (
                  game.best ? (
                    <div className="flex items-center justify-between">
                      <Stars value={game.best.stars} />
                      <span className="text-sm font-medium tabular-nums text-muted-foreground">
                        {game.best.score} ⭐
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t("game.notPlayed")}</p>
                  )
                ) : (
                  <p className="text-sm text-muted-foreground">{t("game.noContent")}</p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
