"use client";

import { useState } from "react";
import { useChildrenPaginatedQuery } from "@/store/api/child-api";
import { useListState } from "@/hooks/use-list-state";
import { useLocale, useT } from "@/lib/i18n/provider";
import { formatDate } from "@/lib/format";
import { AGE_GROUPS, type AgeGroup } from "@/types/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataToolbar } from "@/components/shared/data-toolbar";
import { AgeGroupBadge } from "@/components/shared/badges";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/shared/states";
import { Pager } from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ALL = "all";

export default function AdminChildrenPage() {
  const t = useT();
  const { locale } = useLocale();
  const { page, setPage, resetPage, searchInput, setSearchInput, search, size } = useListState();

  const [ageGroup, setAgeGroup] = useState<string>(ALL);
  const [age, setAge] = useState("");

  const { data, isLoading, isError, refetch } = useChildrenPaginatedQuery({
    page,
    size,
    search: search || undefined,
    ageGroup: ageGroup === ALL ? undefined : (ageGroup as AgeGroup),
    // Aniq yosh berilsa server uni `birthDate` oralig'iga aylantiradi.
    age: age === "" ? undefined : Number(age),
  });

  return (
    <>
      <PageHeader title={t("admin.children")} />

      <DataToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        placeholder={`${t("child.fullName")}, ${t("child.parent")}…`}
        filters={
          <>
            <Select
              value={ageGroup}
              onValueChange={(value) => {
                setAgeGroup(value ?? ALL);
                resetPage();
              }}
            >
              <SelectTrigger className="w-36" aria-label={t("lesson.ageGroup")}>
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

            <Input
              type="number"
              min={0}
              max={18}
              value={age}
              onChange={(event) => {
                setAge(event.target.value);
                resetPage();
              }}
              placeholder={t("child.age")}
              aria-label={t("child.age")}
              className="w-24"
            />
          </>
        }
      />

      {isLoading && <TableSkeleton rows={6} columns={5} />}
      {isError && <ErrorState onRetry={refetch} />}
      {data?.count === 0 && <EmptyState title={t("common.emptyTitle")} />}

      {data && data.count > 0 && (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("child.fullName")}</TableHead>
                      <TableHead>{t("child.age")}</TableHead>
                      <TableHead>{t("lesson.ageGroup")}</TableHead>
                      <TableHead>{t("child.parent")}</TableHead>
                      <TableHead className="text-right">{t("progress.points")}</TableHead>
                      <TableHead className="text-right">{t("progress.streak")}</TableHead>
                      <TableHead>{t("common.date")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {data.items.map((child) => (
                      <TableRow key={child.id}>
                        <TableCell className="font-medium">
                          <span className="mr-1.5">{child.avatar}</span>
                          {child.fullName}
                        </TableCell>
                        <TableCell className="tabular-nums">{child.age}</TableCell>
                        <TableCell>
                          <AgeGroupBadge ageGroup={child.ageGroup} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <span className="block">{child.parent.fullName}</span>
                          <span className="block text-xs">{child.parent.email}</span>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{child.stats?.totalPoints ?? 0}</TableCell>
                        <TableCell className="text-right tabular-nums">{child.stats?.streakDays ?? 0}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(child.createdAt, locale)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={child.active ? "secondary" : "outline"}>
                            {child.active ? t("common.active") : t("common.inactive")}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Pager page={page} size={size} count={data.count} onPageChange={setPage} />
        </>
      )}
    </>
  );
}
