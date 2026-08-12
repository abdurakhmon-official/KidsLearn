"use client";

import { useState } from "react";
import Link from "next/link";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useDeleteGameMutation, useGamesPaginatedQuery } from "@/store/api/game-api";
import { useCategoriesQuery } from "@/store/api/category-api";
import { useListState } from "@/hooks/use-list-state";
import { useT } from "@/lib/i18n/provider";
import { AGE_GROUPS, GAME_TYPES, type AgeGroup, type GameListItem, type GameType } from "@/types/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataToolbar } from "@/components/shared/data-toolbar";
import { AgeGroupBadge } from "@/components/shared/badges";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/shared/states";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Pager } from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ALL = "all";

export default function AdminGamesPage() {
  const t = useT();
  const { page, setPage, resetPage, searchInput, setSearchInput, search, size } = useListState();

  const [ageGroup, setAgeGroup] = useState<string>(ALL);
  const [code, setCode] = useState<string>(ALL);
  const [categoryId, setCategoryId] = useState<string>(ALL);
  const [removing, setRemoving] = useState<GameListItem | null>(null);

  const { data: categories } = useCategoriesQuery({ all: true });
  const { data, isLoading, isError, refetch } = useGamesPaginatedQuery({
    page,
    size,
    search: search || undefined,
    ageGroup: ageGroup === ALL ? undefined : (ageGroup as AgeGroup),
    code: code === ALL ? undefined : (code as GameType),
    categoryId: categoryId === ALL ? undefined : categoryId,
  });

  const codeOptions = [
    { value: ALL, label: t("common.all") },
    ...GAME_TYPES.map((type) => ({ value: type, label: t(`game.type.${type}`) })),
  ];
  const ageOptions = [
    { value: ALL, label: t("common.all") },
    ...AGE_GROUPS.map((group) => ({ value: group, label: t(`ageGroup.${group}`) })),
  ];
  const categoryOptions = [
    { value: ALL, label: t("common.all") },
    ...(categories ?? []).map((category) => ({
      value: category.id,
      label: `${category.icon ?? ""} ${category.name}`.trim(),
    })),
  ];

  const [deleteGame, { isLoading: deleting }] = useDeleteGameMutation();

  const confirmDelete = async () => {
    if (!removing) return;
    await deleteGame(removing.id).unwrap().catch(() => undefined);
    setRemoving(null);
  };

  return (
    <>
      <PageHeader
        title={t("nav.games")}
        action={
          <Button size="sm" render={<Link href="/admin/games/new" />}>
            <PlusIcon data-icon="inline-start" />
            {t("common.add")}
          </Button>
        }
      />

      <DataToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        placeholder={t("common.name")}
        filters={
          <>
            <Select
              value={code}
              onValueChange={(value) => {
                setCode(value ?? ALL);
                resetPage();
              }}
              items={codeOptions}
            >
              <SelectTrigger className="w-40" aria-label={t("nav.games")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {codeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={ageGroup}
              onValueChange={(value) => {
                setAgeGroup(value ?? ALL);
                resetPage();
              }}
              items={ageOptions}
            >
              <SelectTrigger className="w-36" aria-label={t("lesson.ageGroup")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
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
              items={categoryOptions}
            >
              <SelectTrigger className="w-40" aria-label={t("lesson.category")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                      <TableHead>{t("common.name")}</TableHead>
                      <TableHead>{t("nav.games")}</TableHead>
                      <TableHead>{t("lesson.category")}</TableHead>
                      <TableHead>{t("lesson.ageGroup")}</TableHead>
                      <TableHead className="text-right">{t("admin.questions")}</TableHead>
                      <TableHead className="text-right">{t("lesson.points")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                      <TableHead className="w-20" />
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {data.items.map((game) => (
                      <TableRow key={game.id}>
                        <TableCell className="font-medium">{game.title}</TableCell>
                        <TableCell className="text-muted-foreground">{t(`game.type.${game.code}`)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {game.category ? `${game.category.icon} ${game.category.name}` : "—"}
                        </TableCell>
                        <TableCell>
                          <AgeGroupBadge ageGroup={game.ageGroup} />
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {game._count.items === 0 ? (
                            <Badge variant="outline" className="text-warning">
                              0
                            </Badge>
                          ) : (
                            game._count.items
                          )}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{game.pointsPerCorrect}</TableCell>
                        <TableCell>
                          <Badge variant={game.active ? "secondary" : "outline"}>
                            {game.active ? t("common.active") : t("common.inactive")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={t("common.edit")}
                              render={<Link href={`/admin/games/${game.id}`} />}
                            >
                              <PencilIcon />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={t("common.delete")}
                              onClick={() => setRemoving(game)}
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
