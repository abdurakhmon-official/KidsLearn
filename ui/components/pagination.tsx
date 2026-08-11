"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useT } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/button";

export function Pager({
  page,
  size,
  count,
  onPageChange,
}: {
  page: number;
  size: number;
  count: number;
  onPageChange: (page: number) => void;
}) {
  const t = useT();
  const totalPages = Math.max(1, Math.ceil(count / size));

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
      <p className="text-sm text-muted-foreground tabular-nums">
        {t("common.page", { page, total: totalPages })} · {t("common.totalCount", { count })}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeftIcon data-icon="inline-start" />
          {t("common.previous")}
        </Button>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          {t("common.next")}
          <ChevronRightIcon data-icon="inline-end" />
        </Button>
      </div>
    </div>
  );
}
