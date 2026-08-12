"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftIcon, FlameIcon, LogOutIcon, StarIcon } from "lucide-react";
import { useMyProgressQuery } from "@/store/api/progress-api";
import { useAppSelector } from "@/store/hooks";
import { useChildMode } from "@/hooks/use-child-mode";
import { useT } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/button";

export function ChildHeader() {
  const t = useT();
  const pathname = usePathname();
  const child = useAppSelector((state) => state.auth.child);
  const { exit } = useChildMode();

  const { data: progress } = useMyProgressQuery();
  const isHome = pathname === "/play";

  return (
    <header className="flex items-center gap-3 px-4 py-4 md:px-6">
      {!isHome && (
        <Button
          variant="secondary"
          size="icon-lg"
          className="size-14 rounded-2xl"
          aria-label={t("common.back")}
          render={<Link href="/play" />}
        >
          <ArrowLeftIcon className="size-6" />
        </Button>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate font-heading text-xl font-bold">
          <span className="mr-1.5">{child?.avatar}</span>
          {child?.fullName}
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-2xl bg-card px-3 py-2 text-base font-semibold tabular-nums ring-1 ring-border">
        <span className="flex items-center gap-1">
          <StarIcon className="size-5 fill-medal-gold text-medal-gold" />
          {progress?.stats?.totalPoints ?? 0}
        </span>
        <span className="flex items-center gap-1">
          <FlameIcon className="size-5 text-warning" />
          {progress?.stats?.streakDays ?? 0}
        </span>
      </div>

      <Button
        variant="ghost"
        size="icon-lg"
        className="size-14 rounded-2xl"
        onClick={exit}
        aria-label={t("child.backToParent")}
      >
        <LogOutIcon className="size-6" />
      </Button>
    </header>
  );
}
