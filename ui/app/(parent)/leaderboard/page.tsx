"use client";

import { useState } from "react";
import { FlameIcon, StarIcon, TrophyIcon } from "lucide-react";
import { useLeaderboardQuery } from "@/store/api/dashboard-api";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import { AGE_GROUPS, type AgeGroup, type LeaderboardPeriod } from "@/types/api";
import { PageHeader } from "@/components/shared/page-header";
import { AgeGroupBadge } from "@/components/shared/badges";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/shared/states";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ALL = "all-groups";

/** Podiumdagi uch o'rin — rang medal token'laridan. */
const PODIUM = ["ring-medal-gold/50 bg-medal-gold/10", "ring-medal-silver/50 bg-medal-silver/10", "ring-medal-bronze/50 bg-medal-bronze/10"];

export default function LeaderboardPage() {
  const t = useT();
  const [period, setPeriod] = useState<LeaderboardPeriod>("week");
  const [ageGroup, setAgeGroup] = useState<string>(ALL);

  const { data, isLoading, isError, refetch } = useLeaderboardQuery({
    period,
    ageGroup: ageGroup === ALL ? undefined : (ageGroup as AgeGroup),
    limit: 20,
  });

  return (
    <>
      <PageHeader
        title={t("nav.leaderboard")}
        action={
          <Select value={ageGroup} onValueChange={(value) => setAgeGroup(value ?? ALL)}>
            <SelectTrigger className="w-40" aria-label={t("lesson.ageGroup")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t("common.all")}</SelectItem>
              {AGE_GROUPS.map((group) => (
                <SelectItem key={group} value={group}>
                  {t(`ageGroup.${group}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <Tabs value={period} onValueChange={(value) => setPeriod(value as LeaderboardPeriod)}>
        <TabsList>
          <TabsTrigger value="week">{t("dashboard.weekly")}</TabsTrigger>
          <TabsTrigger value="month">{t("dashboard.monthly")}</TabsTrigger>
          <TabsTrigger value="all">{t("common.all")}</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading && <TableSkeleton rows={6} columns={1} />}
      {isError && <ErrorState onRetry={refetch} />}
      {data?.length === 0 && <EmptyState icon={TrophyIcon} title={t("dashboard.noData")} />}

      {data && data.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
              {data.map((row) => (
                <li key={row.child.id} className="flex items-center gap-3 px-4 py-3">
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums ring-2",
                      row.rank <= 3 ? PODIUM[row.rank - 1] : "bg-muted text-muted-foreground ring-transparent",
                    )}
                  >
                    {row.rank}
                  </span>

                  <span className="text-2xl">{row.child.avatar ?? "🙂"}</span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{row.child.fullName}</p>
                    <AgeGroupBadge ageGroup={row.child.ageGroup} />
                  </div>

                  <div className="flex items-center gap-4 text-sm tabular-nums">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <FlameIcon className="size-4 text-warning" />
                      {row.streakDays}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <StarIcon className="size-4 fill-medal-gold text-medal-gold" />
                      {row.stars}
                    </span>
                    <span className="w-14 text-right font-semibold">{row.points}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </>
  );
}
