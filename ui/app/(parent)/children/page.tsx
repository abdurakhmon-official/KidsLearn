"use client";

import { useState } from "react";
import Link from "next/link";
import { ChartLineIcon, FlameIcon, PencilIcon, PlayIcon, PlusIcon, StarIcon, Trash2Icon } from "lucide-react";
import { useDeleteChildMutation, useListChildrenQuery } from "@/store/api/child-api";
import { useChildMode } from "@/hooks/use-child-mode";
import { useT } from "@/lib/i18n/provider";
import type { ChildWithStats } from "@/types/api";
import { PageHeader } from "@/components/shared/page-header";
import { AgeGroupBadge } from "@/components/shared/badges";
import { CardsSkeleton, EmptyState, ErrorState } from "@/components/shared/states";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ChildFormDialog } from "@/components/parent/child-form-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function ChildrenPage() {
  const t = useT();
  const { data: children, isLoading, isError, refetch } = useListChildrenQuery();
  const { enter, pendingChildId } = useChildMode();
  const [deleteChild, { isLoading: deleting }] = useDeleteChildMutation();

  const [editing, setEditing] = useState<ChildWithStats | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [removing, setRemoving] = useState<ChildWithStats | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (child: ChildWithStats) => {
    setEditing(child);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!removing) return;
    await deleteChild(removing.id).unwrap().catch(() => undefined);
    setRemoving(null);
  };

  return (
    <>
      <PageHeader
        title={t("nav.children")}
        action={
          <Button onClick={openCreate}>
            <PlusIcon data-icon="inline-start" />
            {t("child.addChild")}
          </Button>
        }
      />

      {isLoading && <CardsSkeleton count={3} />}
      {isError && <ErrorState onRetry={refetch} />}

      {children?.length === 0 && (
        <EmptyState
          title={t("child.noChildren")}
          description={t("child.noChildrenBody")}
          action={
            <Button onClick={openCreate}>
              <PlusIcon data-icon="inline-start" />
              {t("child.addChild")}
            </Button>
          }
        />
      )}

      {children && children.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {children.map((child) => (
            <Card key={child.id}>
              <CardContent className="flex items-start gap-3">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted text-3xl">
                  {child.avatar ?? child.fullName.charAt(0).toUpperCase()}
                </span>

                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="truncate font-heading text-base font-semibold">{child.fullName}</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <AgeGroupBadge ageGroup={child.ageGroup} />
                    <span className="text-xs text-muted-foreground">
                      {t("child.ageValue", { age: child.age })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground tabular-nums">
                    <span className="flex items-center gap-1">
                      <StarIcon className="size-3.5 fill-medal-gold text-medal-gold" />
                      {child.stats?.totalPoints ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <FlameIcon className="size-3.5 text-warning" />
                      {child.stats?.streakDays ?? 0}
                    </span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="gap-1 border-t">
                <Button
                  size="sm"
                  onClick={() => enter(child.id)}
                  disabled={Boolean(pendingChildId)}
                  className="mr-auto"
                >
                  <PlayIcon data-icon="inline-start" />
                  {t("child.enterMode")}
                </Button>

                <Button variant="ghost" size="icon-sm" render={<Link href={`/children/${child.id}`} />} aria-label={t("progress.title")}>
                  <ChartLineIcon />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => openEdit(child)} aria-label={t("common.edit")}>
                  <PencilIcon />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setRemoving(child)}
                  aria-label={t("common.delete")}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2Icon />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <ChildFormDialog open={formOpen} onOpenChange={setFormOpen} child={editing} />

      <ConfirmDialog
        open={Boolean(removing)}
        onOpenChange={(open) => !open && setRemoving(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title={removing?.fullName}
        description={t("child.deleteWarning")}
      />
    </>
  );
}
