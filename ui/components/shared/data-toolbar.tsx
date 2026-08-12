"use client";

import type { ReactNode } from "react";
import { SearchIcon, XIcon } from "lucide-react";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export function DataToolbar({
  search,
  onSearchChange,
  placeholder,
  filters,
  action,
  className,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  filters?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const t = useT();

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div className="relative min-w-56 flex-1">
        <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={placeholder ?? t("common.search")}
          aria-label={t("common.search")}
          className="pl-8 pr-8"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label={t("common.reset")}
            className="absolute right-1.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <XIcon className="size-3.5" />
          </button>
        )}
      </div>

      {filters}
      {action && <div className="ml-auto">{action}</div>}
    </div>
  );
}
