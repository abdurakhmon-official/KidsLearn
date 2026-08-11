"use client";

import { useMyAwardsQuery, useMyProgressQuery } from "@/store/api/progress-api";
import { useT } from "@/lib/i18n/provider";
import { MedalCoin } from "@/components/shared/badges";
import { CardsSkeleton, ErrorState } from "@/components/shared/states";
import { CertificateButton } from "@/components/child/certificate-button";

export default function ChildProgressPage() {
  const t = useT();
  const { data, isLoading, isError, refetch } = useMyProgressQuery();
  const { data: awards } = useMyAwardsQuery();

  if (isLoading) return <CardsSkeleton count={4} />;
  if (isError || !data) return <ErrorState onRetry={refetch} />;

  const tiles = [
    { emoji: "⭐", label: t("progress.points"), value: data.stats?.totalPoints ?? 0 },
    { emoji: "🌟", label: t("progress.stars"), value: data.stats?.totalStars ?? 0 },
    { emoji: "🔥", label: t("progress.streak"), value: data.stats?.streakDays ?? 0 },
    { emoji: "🎮", label: t("progress.gamesPlayed"), value: data.games.played },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl font-bold md:text-4xl">🏆 {t("progress.title")}</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="flex flex-col items-center gap-1 rounded-[--density-radius] bg-card p-5 text-center ring-2 ring-border"
          >
            <span className="text-4xl" aria-hidden>
              {tile.emoji}
            </span>
            <span className="font-heading text-3xl font-bold tabular-nums">{tile.value}</span>
            <span className="text-sm text-muted-foreground">{tile.label}</span>
          </div>
        ))}
      </div>

      <section className="space-y-4 rounded-[--density-radius] bg-card p-5 ring-2 ring-border">
        <div className="flex items-baseline justify-between">
          <h2 className="font-heading text-xl font-bold">📚 {t("lesson.title")}</h2>
          <span className="text-lg font-semibold tabular-nums">
            {data.lessons.completed} / {data.lessons.available}
          </span>
        </div>
        <div className="h-4 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-success transition-[width] duration-500 ease-out"
            style={{ width: `${data.lessons.percent}%` }}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-2xl font-bold">🏅 {t("award.title")}</h2>

        {awards?.earned.length ? (
          <div className="flex flex-wrap gap-5">
            {awards.earned.map((award) => (
              <div key={award.id} className="flex w-24 flex-col items-center gap-2 text-center">
                <MedalCoin medal={award.medal} icon={award.icon} size="lg" />
                <span className="text-sm font-medium leading-tight">{award.title}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-lg text-muted-foreground">{t("award.empty")}</p>
        )}

        {awards?.locked.length ? (
          <>
            <h3 className="pt-2 font-heading text-lg font-medium text-muted-foreground">
              {t("award.locked")}
            </h3>
            <div className="flex flex-wrap gap-5">
              {awards.locked.map((award) => (
                <div key={award.code} className="flex w-24 flex-col items-center gap-2 text-center">
                  <MedalCoin medal={award.medal} icon={award.icon} locked size="lg" />
                  <span className="text-sm leading-tight text-muted-foreground">{award.title}</span>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </section>

      <CertificateButton progress={data} awardCount={awards?.count ?? 0} />
    </div>
  );
}
