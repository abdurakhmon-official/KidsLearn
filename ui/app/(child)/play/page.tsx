"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useMyProgressQuery } from "@/store/api/progress-api";
import { useAppSelector } from "@/store/hooks";
import { useT } from "@/lib/i18n/provider";
import { useSpeaker } from "@/hooks/use-speaker";

const TILES = [
  {
    href: "/play/lessons",
    emoji: "📚",
    titleKey: "lesson.title",
    className: "bg-age-5-7/15 ring-age-5-7/40 hover:ring-age-5-7",
  },
  {
    href: "/play/games",
    emoji: "🎮",
    titleKey: "game.title",
    className: "bg-age-3-4/15 ring-age-3-4/40 hover:ring-age-3-4",
  },
  {
    href: "/play/progress",
    emoji: "🏆",
    titleKey: "progress.title",
    className: "bg-age-1-2/15 ring-age-1-2/40 hover:ring-age-1-2",
  },
] as const;

export default function PlayHomePage() {
  const t = useT();
  const speaker = useSpeaker();
  const child = useAppSelector((state) => state.auth.child);
  const { data: progress } = useMyProgressQuery();

  useEffect(() => {
    if (!child?.fullName) return;

    speaker.sayAll([
      { phraseKey: "play.greeting", text: t("play.greeting") },
      { text: child.fullName },
    ]);
  }, [child?.fullName, speaker, t]);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-heading text-4xl font-bold text-balance md:text-5xl">
          {t("play.greeting")}, {child?.fullName}! 👋
        </h1>
        <p className="mt-3 text-xl text-muted-foreground tabular-nums">
          ⭐ {progress?.stats?.totalPoints ?? 0} · 🔥 {progress?.stats?.streakDays ?? 0}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {TILES.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            onClick={() => speaker.sayKey(tile.titleKey)}
            className={`flex flex-col items-center justify-center gap-4 rounded-[--density-radius] p-8 ring-4 transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-8 active:scale-95 ${tile.className}`}
          >
            <span className="text-7xl md:text-8xl" aria-hidden>
              {tile.emoji}
            </span>
            <span className="font-heading text-2xl font-bold">{t(tile.titleKey)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
