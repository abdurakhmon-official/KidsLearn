"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeftIcon, BookOpenIcon, FlameIcon, GamepadIcon, StarIcon, TargetIcon } from "lucide-react";
import { useChildAwardsQuery, useChildProgressQuery } from "@/store/api/child-api";
import { useLocale, useT } from "@/lib/i18n/provider";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { AgeGroupBadge, MedalCoin, Stars } from "@/components/shared/badges";
import { ErrorState, StatsSkeleton } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ChildDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useT();
  const { locale } = useLocale();

  const { data, isLoading, isError, refetch } = useChildProgressQuery(id);
  const { data: awards } = useChildAwardsQuery(id);

  if (isLoading) return <StatsSkeleton />;
  if (isError || !data) return <ErrorState onRetry={refetch} />;

  return (
    <>
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <span className="text-3xl">{data.child.avatar}</span>
            {data.child.fullName}
          </span>
        }
        description={
          <span className="flex items-center gap-2">
            <AgeGroupBadge ageGroup={data.child.ageGroup} />
            <span>{t("child.ageValue", { age: data.child.age })}</span>
          </span>
        }
        action={
          <Button variant="outline" render={<Link href="/children" />}>
            <ArrowLeftIcon data-icon="inline-start" />
            {t("common.back")}
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("progress.points")} value={data.stats?.totalPoints ?? 0} icon={StarIcon} />
        <StatCard label={t("progress.stars")} value={data.stats?.totalStars ?? 0} icon={StarIcon} accent="muted" />
        <StatCard
          label={t("progress.streak")}
          value={t("progress.streakDays", { days: data.stats?.streakDays ?? 0 })}
          hint={`${t("progress.longestStreak")}: ${data.stats?.longestStreak ?? 0}`}
          icon={FlameIcon}
          accent="warning"
        />
        <StatCard label={t("progress.accuracy")} value={`${data.games.accuracy}%`} icon={TargetIcon} accent="success" />
      </section>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t("nav.overview")}</TabsTrigger>
          <TabsTrigger value="awards">{t("award.title")}</TabsTrigger>
          <TabsTrigger value="activity">{t("progress.recentActivity")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpenIcon className="size-4 text-success" />
                {t("lesson.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="font-heading text-3xl font-semibold tabular-nums">
                  {data.lessons.completed}
                  <span className="text-base text-muted-foreground"> / {data.lessons.available}</span>
                </span>
                <span className="text-sm text-muted-foreground tabular-nums">{data.lessons.percent}%</span>
              </div>
              <Progress value={data.lessons.percent} />
              <p className="text-xs text-muted-foreground">
                {t("lesson.inProgress")}: {data.lessons.inProgress}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GamepadIcon className="size-4 text-warning" />
                {t("game.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-heading text-3xl font-semibold tabular-nums">{data.games.played}</p>
              <dl className="space-y-1 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <dt>{t("progress.points")}</dt>
                  <dd className="tabular-nums">{data.games.totalScore}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>{t("progress.stars")}</dt>
                  <dd className="tabular-nums">{data.games.totalStars}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="awards" className="mt-4">
          <Card>
            <CardContent className="space-y-6">
              <div>
                <p className="mb-3 text-sm font-medium">
                  {t("award.earned")} ({awards?.count ?? 0})
                </p>
                {awards?.earned.length ? (
                  <div className="flex flex-wrap gap-4">
                    {awards.earned.map((award) => (
                      <div key={award.id} className="flex w-24 flex-col items-center gap-1.5 text-center">
                        <MedalCoin medal={award.medal} icon={award.icon} />
                        <span className="text-xs font-medium leading-tight">{award.title}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("award.empty")}</p>
                )}
              </div>

              {awards?.locked.length ? (
                <div>
                  <p className="mb-3 text-sm font-medium text-muted-foreground">{t("award.locked")}</p>
                  <div className="flex flex-wrap gap-4">
                    {awards.locked.map((award) => (
                      <div key={award.code} className="flex w-24 flex-col items-center gap-1.5 text-center">
                        <MedalCoin medal={award.medal} icon={award.icon} locked />
                        <span className="text-xs leading-tight text-muted-foreground">{award.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardContent>
              {data.recentSessions.length ? (
                <ul className="divide-y">
                  {data.recentSessions.map((session) => (
                    <li key={session.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{session.game.title}</p>
                        <p className="text-xs text-muted-foreground tabular-nums">
                          {t("game.correctCount", {
                            correct: session.correctCount,
                            total: session.totalItems,
                          })}{" "}
                          · {formatDate(session.createdAt, locale)}
                        </p>
                      </div>
                      <Stars value={session.stars} size="sm" />
                      <span className="w-12 shrink-0 text-right text-sm font-medium tabular-nums">
                        +{session.score}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">{t("progress.noActivity")}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
