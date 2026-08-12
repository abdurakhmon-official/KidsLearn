"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpenIcon,
  ClockIcon,
  FlameIcon,
  GamepadIcon,
  SparklesIcon,
  StarIcon,
  TrendingUpIcon,
} from "lucide-react";
import { useParentDashboardQuery } from "@/store/api/dashboard-api";
import { useListChildrenQuery } from "@/store/api/child-api";
import { useLocale, useT } from "@/lib/i18n/provider";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { AgeGroupBadge, MedalCoin, Stars } from "@/components/shared/badges";
import { CardsSkeleton, EmptyState, ErrorState, StatsSkeleton } from "@/components/shared/states";
import { ActivityChart } from "@/components/charts/activity-chart";
import { CategoryAccuracyChart } from "@/components/charts/category-accuracy-chart";
import { ChartFrame } from "@/components/charts/chart-primitives";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardPage() {
  const t = useT();
  const { locale } = useLocale();

  const { data: children } = useListChildrenQuery();
  const [childId, setChildId] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<"weekly" | "monthly">("weekly");

  const { data, isLoading, isError, refetch } = useParentDashboardQuery(childId ? { childId } : undefined);

  if (isLoading) {
    return (
      <>
        <StatsSkeleton />
        <CardsSkeleton count={2} className="xl:grid-cols-2" />
      </>
    );
  }

  if (isError && !children?.length) {
    return (
      <EmptyState
        title={t("child.noChildren")}
        description={t("child.noChildrenBody")}
        action={
          <Button render={<Link href="/children" />}>
            <SparklesIcon data-icon="inline-start" />
            {t("child.addChild")}
          </Button>
        }
      />
    );
  }

  if (isError || !data) return <ErrorState onRetry={refetch} />;

  const chart = range === "weekly" ? data.weekly : data.monthly;

  return (
    <>
      <PageHeader
        title={data.child.fullName}
        description={
          <span className="flex items-center gap-2">
            <AgeGroupBadge ageGroup={data.child.ageGroup} />
            <span>{t("child.ageValue", { age: data.child.age })}</span>
          </span>
        }
        action={
          children && children.length > 1 ? (
            <Select
              value={childId ?? data.child.id}
              onValueChange={(value) => setChildId(value ?? undefined)}

              items={children.map((child) => ({
                value: child.id,
                label: [child.avatar, child.fullName].filter(Boolean).join(" "),
              }))}
            >
              <SelectTrigger className="w-48" aria-label={t("dashboard.selectChild")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.avatar} {child.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("dashboard.todayPoints")} value={data.today.points} icon={TrendingUpIcon} />
        <StatCard label={t("dashboard.todayGames")} value={data.today.gamesPlayed} icon={GamepadIcon} accent="warning" />
        <StatCard label={t("dashboard.todayLessons")} value={data.today.lessonsCompleted} icon={BookOpenIcon} accent="success" />
        <StatCard label={t("dashboard.activeMinutes")} value={data.today.activeMinutes} icon={ClockIcon} accent="muted" />
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={t("progress.streak")}
          value={t("progress.streakDays", { days: data.totals.streakDays })}
          icon={FlameIcon}
          accent="warning"
        />
        <StatCard label={t("progress.points")} value={data.totals.totalPoints} icon={SparklesIcon} />
        <StatCard label={t("progress.stars")} value={data.totals.totalStars} icon={StarIcon} accent="muted" />
      </section>

      <Card>
        <CardContent>
          <ChartFrame
            title={t("dashboard.activityChart")}
            action={
              <Tabs value={range} onValueChange={(value) => setRange(value as typeof range)}>
                <TabsList>
                  <TabsTrigger value="weekly">{t("dashboard.weekly")}</TabsTrigger>
                  <TabsTrigger value="monthly">{t("dashboard.monthly")}</TabsTrigger>
                </TabsList>
              </Tabs>
            }
          >
            <ActivityChart days={chart.days} />
          </ChartFrame>
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.bestSubjects")}</CardTitle>
          </CardHeader>
          <CardContent>
            {data.bestSubjects.length ? (
              <div className="h-52">
                <CategoryAccuracyChart rows={data.bestSubjects} />
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">{t("dashboard.noData")}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.hardSubjects")}</CardTitle>
          </CardHeader>
          <CardContent>
            {data.hardSubjects.length ? (
              <div className="h-52">
                <CategoryAccuracyChart rows={data.hardSubjects} />
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">{t("dashboard.noData")}</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.recentAwards")}</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentAwards.length ? (
              <ul className="space-y-3">
                {data.recentAwards.map((award) => (
                  <li key={award.id} className="flex items-center gap-3">
                    <MedalCoin medal={award.medal} icon={award.icon} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{award.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{award.description}</p>
                    </div>
                    <time className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(award.earnedAt, locale)}
                    </time>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">{t("award.empty")}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.recentSessions")}</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentSessions.length ? (
              <ul className="space-y-3">
                {data.recentSessions.map((session) => (
                  <li key={session.id} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{session.game.title}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {t("game.correctCount", {
                          correct: session.correctCount,
                          total: session.totalItems,
                        })}
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
      </section>
    </>
  );
}
