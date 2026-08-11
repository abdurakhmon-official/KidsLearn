"use client";

import type { ReactNode } from "react";
import { useT } from "@/lib/i18n/provider";

/** O'yin ustidagi progress chizig'i va sanoq. */
export function GameShell({
  title,
  index,
  total,
  action,
  children,
}: {
  title: string;
  index: number;
  total: number;
  action?: ReactNode;
  children: ReactNode;
}) {
  const t = useT();
  const percent = total ? Math.round(((index + 1) / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-heading text-2xl font-bold md:text-3xl">{title}</h1>
          <span className="shrink-0 text-lg font-semibold tabular-nums text-muted-foreground">
            {t("game.progress", { current: index + 1, total })}
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {children}

      {action}
    </div>
  );
}
