"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2Icon, RotateCcwIcon } from "lucide-react";
import { useT } from "@/lib/i18n/provider";
import { useSpeaker } from "@/hooks/use-speaker";
import { cn } from "@/lib/utils";
import type { PlayItem, SubmitGameResult } from "@/types/api";
import { AwardDialog } from "@/components/child/award-dialog";
import { Stars } from "@/components/shared/badges";
import { Button } from "@/components/ui/button";

export function GameResult({
  result,
  items,
  onRestart,
}: {
  result: SubmitGameResult;
  items: PlayItem[];
  onRestart: () => void;
}) {
  const t = useT();
  const speaker = useSpeaker();
  const [awardsOpen, setAwardsOpen] = useState(true);

  const { session, results } = result;

  useEffect(() => {
    speaker.sayText(`${t("game.resultTitle")} ${session.correctCount}`);
  }, [session.correctCount, speaker, t]);

  const labelFor = (itemId: string, value: string | null) => {
    const item = items.find((entry) => entry.id === itemId);
    const option = item?.options.find((entry) => entry.value === value);
    return option?.label ?? value ?? "—";
  };

  const promptFor = (itemId: string) => items.find((entry) => entry.id === itemId)?.promptText ?? "";

  return (
    <div className="space-y-8 text-center">
      <div className="space-y-4">
        <p className="text-7xl" aria-hidden>
          {session.stars >= 3 ? "🎉" : session.stars >= 1 ? "👏" : "💪"}
        </p>
        <h1 className="font-heading text-4xl font-bold">{t("game.resultTitle")}</h1>

        <div className="flex justify-center">
          <Stars value={session.stars} size="lg" />
        </div>

        <p className="text-xl tabular-nums">
          {t("game.correctCount", { correct: session.correctCount, total: session.totalItems })}
        </p>
        <p className="font-heading text-3xl font-bold text-primary tabular-nums">+{session.score} ⭐</p>
      </div>

      <ul className="space-y-2 text-left">
        {results.map((entry) => (
          <li
            key={entry.itemId}
            className={cn(
              "flex items-center gap-3 rounded-2xl p-4 ring-2",
              entry.isCorrect
                ? "bg-success/15 ring-success/40"
                : "bg-warning/15 ring-warning/40",
            )}
          >
            <span className="text-2xl" aria-hidden>
              {entry.isCorrect ? "✅" : "🔁"}
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-base font-medium">{promptFor(entry.itemId)}</p>
              {!entry.isCorrect && (
                <p className="text-sm text-muted-foreground">
                  {t("game.correct")}: <strong>{labelFor(entry.itemId, entry.correctValue)}</strong>
                </p>
              )}
            </div>

            <span className="shrink-0 text-sm font-medium">
              {entry.isCorrect ? t("game.correct") : t("game.wrong")}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" className="h-16 flex-1 text-xl" onClick={onRestart}>
          <RotateCcwIcon data-icon="inline-start" />
          {t("game.playAgain")}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-16 flex-1 text-xl"
          render={<Link href="/play/games" />}
        >
          <CheckCircle2Icon data-icon="inline-start" />
          {t("game.otherGames")}
        </Button>
      </div>

      <AwardDialog awards={awardsOpen ? result.awards : []} onClose={() => setAwardsOpen(false)} />
    </div>
  );
}
