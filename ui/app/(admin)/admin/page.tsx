"use client";

import {
  BookOpenIcon,
  GamepadIcon,
  ImageIcon,
  ShieldIcon,
  SparklesIcon,
  TrendingUpIcon,
  UserRoundIcon,
  UsersRoundIcon,
} from "lucide-react";
import { useAdminDashboardQuery } from "@/store/api/dashboard-api";
import { useT } from "@/lib/i18n/provider";
import { AGE_GROUPS } from "@/types/api";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ErrorState, StatsSkeleton } from "@/components/shared/states";
import { AdminActivityChart } from "@/components/charts/admin-activity-chart";
import { ChartFrame } from "@/components/charts/chart-primitives";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Yosh guruhi ranglari — badge'lardagi bilan bir xil token. */
const AGE_BARS: Record<string, string> = {
  AGE_1_2: "bg-age-1-2",
  AGE_3_4: "bg-age-3-4",
  AGE_5_7: "bg-age-5-7",
};

export default function AdminDashboardPage() {
  const t = useT();
  const { data, isLoading, isError, refetch } = useAdminDashboardQuery();

  if (isLoading) return <StatsSkeleton count={8} />;
  if (isError || !data) return <ErrorState onRetry={refetch} />;

  const { totals, childrenByAgeGroup, activityChart } = data;
  const maxGroup = Math.max(1, ...AGE_GROUPS.map((group) => childrenByAgeGroup[group]));

  return (
    <>
      <PageHeader title={t("admin.title")} />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("admin.parents")} value={totals.parents} icon={UsersRoundIcon} />
        <StatCard label={t("admin.children")} value={totals.children} icon={UserRoundIcon} accent="success" />
        <StatCard label={t("nav.lessons")} value={totals.lessons} icon={BookOpenIcon} />
        <StatCard label={t("nav.games")} value={totals.games} icon={GamepadIcon} accent="warning" />
        <StatCard label={t("admin.mediaAssets")} value={totals.mediaAssets} icon={ImageIcon} accent="muted" />
        <StatCard label={t("admin.gameSessions")} value={totals.gameSessions} icon={SparklesIcon} />
        <StatCard label={t("admin.activeToday")} value={totals.activeChildrenToday} icon={TrendingUpIcon} accent="success" />
        <StatCard label={t("admin.admins")} value={totals.admins} icon={ShieldIcon} accent="muted" />
      </section>

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardContent>
            <ChartFrame
              title={`${t("dashboard.activityChart")} · ${t("admin.pointsLast14")}: ${totals.pointsLast14Days}`}
              height="h-64"
            >
              <AdminActivityChart days={activityChart} />
            </ChartFrame>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.childrenByAge")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {AGE_GROUPS.map((group) => {
              const count = childrenByAgeGroup[group];

              return (
                <div key={group} className="space-y-1.5">
                  <div className="flex items-baseline justify-between text-sm">
                    <span>{t(`ageGroup.${group}`)}</span>
                    <span className="font-medium tabular-nums">{count}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-[width] duration-500 ease-out ${AGE_BARS[group]}`}
                      style={{ width: `${(count / maxGroup) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
