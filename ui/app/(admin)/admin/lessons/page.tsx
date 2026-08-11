"use client";

import { useState } from "react";
import Link from "next/link";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useDeleteLessonMutation, useLessonsPaginatedQuery } from "@/store/api/lesson-api";
import { useCategoriesQuery } from "@/store/api/category-api";
import { useListState } from "@/hooks/use-list-state";
import { useLocale, useT } from "@/lib/i18n/provider";
import { formatDate } from "@/lib/format";
import { AGE_GROUPS, type AgeGroup, type LessonListItem } from "@/types/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataToolbar } from "@/components/shared/data-toolbar";
import { AgeGroupBadge } from "@/components/shared/badges";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/shared/states";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Pager } from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ALL = "all";

export default function AdminLessonsPage() {
  const t = useT();
  const { locale } = useLocale();
  const { page, setPage, resetPage, searchInput, setSearchInput, search, size } = useListState();

  const [ageGroup, setAgeGroup] = useState<string>(ALL);
  const [categoryId, setCategoryId] = useState<string>(ALL);
  const [from, setFrom] = useState("");
  const [removing, setRemoving] = useState<LessonListItem | null>(null);

  const { data: categories } = useCategoriesQuery({ all: true });
  const { data, isLoading, isError, refetch } = useLessonsPaginatedQuery({
    page,
    size,
    search: search || undefined,
    ageGroup: ageGroup === ALL ? undefined : (ageGroup as AgeGroup),
    categoryId: categoryId === ALL ? undefined : categoryId,
    from: from || undefined,
  });

  const [deleteLesson, { isLoading: deleting }] = useDeleteLessonMutation();

  const confirmDelete = async () => {
    if (!removing) return;
    await deleteLesson(removing.id).unwrap().catch(() => undefined);
    setRemoving(null);
  };

  return (
    <>
      <PageHeader
        title={t("nav.lessons")}
        action={
          <Button size="sm" render={<Link href="/admin/lessons/new" />}>
            <PlusIcon data-icon="inline-start" />
            {t("common.add")}
          </Button>
        }
      />

      <DataToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        placeholder={t("lesson.name")}
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

            <Select
              value={categoryId}
              onValueChange={(value) => {
                setCategoryId(value ?? ALL);
                resetPage();
              }}
            >
              <SelectTrigger className="w-40" aria-label={t("lesson.category")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{t("common.all")}</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={from}
              onChange={(event) => {
                setFrom(event.target.value);
                resetPage();
              }}
              aria-label={t("common.date")}
              className="w-40"
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
                      <TableHead>{t("lesson.name")}</TableHead>
                      <TableHead>{t("lesson.category")}</TableHead>
                      <TableHead>{t("lesson.ageGroup")}</TableHead>
                      <TableHead className="text-right">{t("lesson.points")}</TableHead>
                      <TableHead className="text-right">{t("nav.media")}</TableHead>
                      <TableHead>{t("common.date")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                      <TableHead className="w-20" />
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {data.items.map((lesson) => (
                      <TableRow key={lesson.id}>
                        <TableCell className="font-medium">{lesson.title}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {lesson.category.icon} {lesson.category.name}
                        </TableCell>
                        <TableCell>
                          <AgeGroupBadge ageGroup={lesson.ageGroup} />
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{lesson.points}</TableCell>
                        <TableCell className="text-right tabular-nums">{lesson._count.media}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(lesson.createdAt, locale)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={lesson.active ? "secondary" : "outline"}>
                            {lesson.active ? t("common.active") : t("common.inactive")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={t("common.edit")}
                              render={<Link href={`/admin/lessons/${lesson.id}`} />}
                            >
                              <PencilIcon />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={t("common.delete")}
                              onClick={() => setRemoving(lesson)}
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2Icon />
                            </Button>
                          </div>
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

      <ConfirmDialog
        open={Boolean(removing)}
        onOpenChange={(open) => !open && setRemoving(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title={removing?.title}
      />
    </>
  );
}
