"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboardIcon, Loader2Icon, LogOutIcon, PlusIcon } from "lucide-react";
import { useListChildrenQuery } from "@/store/api/child-api";
import { useChildMode } from "@/hooks/use-child-mode";
import { useSignOut } from "@/hooks/use-sign-out";
import { useAppSelector } from "@/store/hooks";
import { useT } from "@/lib/i18n/provider";
import { ChildFormDialog } from "@/components/parent/child-form-dialog";
import { AgeGroupBadge } from "@/components/shared/badges";
import { CardsSkeleton, ErrorState } from "@/components/shared/states";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { Button } from "@/components/ui/button";

export default function SelectChildPage() {
  const t = useT();
  const isAdmin = useAppSelector((state) => state.auth.role === "ADMIN");

  const { data: children, isLoading, isError, refetch } = useListChildrenQuery();
  const { enter, pendingChildId } = useChildMode();
  const { signOut, isSigningOut } = useSignOut();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(ellipse_at_top,var(--accent),var(--background))]">
      <header className="flex items-center justify-end gap-1 p-4">
        <LanguageToggle />
        <ThemeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-4 pb-16">
        <div className="mb-10 text-center">
          <h1 className="font-heading text-3xl font-bold text-balance sm:text-4xl">{t("child.selectTitle")}</h1>
          <p className="mt-2 text-muted-foreground">{t("child.selectSubtitle")}</p>
        </div>

        {isLoading && <CardsSkeleton count={3} />}

        {isError && <ErrorState onRetry={refetch} />}

        {children && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {children.map((child) => (
              <button
                key={child.id}
                type="button"
                onClick={() => enter(child.id)}
                disabled={Boolean(pendingChildId)}
                className="group flex flex-col items-center gap-3 rounded-2xl p-4 transition-transform hover:bg-card/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:scale-95 disabled:opacity-60"
              >
                <span className="relative flex size-24 items-center justify-center rounded-2xl bg-card text-5xl ring-2 ring-border transition-colors group-hover:ring-primary">
                  {pendingChildId === child.id ? (
                    <Loader2Icon className="size-8 animate-spin text-primary" />
                  ) : (
                    (child.avatar ?? child.fullName.charAt(0).toUpperCase())
                  )}
                </span>

                <span className="space-y-1 text-center">
                  <span className="block font-heading text-lg font-semibold">{child.fullName}</span>
                  <AgeGroupBadge ageGroup={child.ageGroup} />
                </span>

                <span className="flex items-center gap-3 text-xs text-muted-foreground tabular-nums">
                  <span>⭐ {child.stats?.totalPoints ?? 0}</span>
                  <span>🔥 {child.stats?.streakDays ?? 0}</span>
                </span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="group flex flex-col items-center gap-3 rounded-2xl p-4 transition-transform hover:bg-card/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:scale-95"
            >
              <span className="flex size-24 items-center justify-center rounded-2xl border-2 border-dashed border-border text-muted-foreground transition-colors group-hover:border-primary group-hover:text-primary">
                <PlusIcon className="size-8" />
              </span>
              <span className="font-heading text-lg font-medium text-muted-foreground">{t("child.addChild")}</span>
            </button>
          </div>
        )}

        {children?.length === 0 && (
          <p className="mt-6 text-center text-sm text-muted-foreground">{t("child.noChildrenBody")}</p>
        )}

        <div className="mt-12 flex flex-wrap justify-center gap-2">
          <Button variant="outline" render={<Link href={isAdmin ? "/admin" : "/dashboard"} />}>
            <LayoutDashboardIcon data-icon="inline-start" />
            {isAdmin ? t("nav.adminPanel") : t("child.parentCabinet")}
          </Button>
          <Button variant="ghost" onClick={signOut} disabled={isSigningOut}>
            {isSigningOut ? (
              <Loader2Icon data-icon="inline-start" className="animate-spin" />
            ) : (
              <LogOutIcon data-icon="inline-start" />
            )}
            {isSigningOut ? t("nav.loggingOut") : t("nav.logout")}
          </Button>
        </div>
      </main>

      <ChildFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
