"use client";

import type { ComponentType, ReactNode } from "react";
import { AlertCircleIcon, InboxIcon } from "lucide-react";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Bo'sh / yuklanmoqda / xato — uchalasi bir xil skeletda, shunda ekrandan
 * ekranga o'tganda joylashuv sakramaydi.
 */

type StateProps = {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

function StateShell({ icon: Icon = InboxIcon, title, description, action, className }: StateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 px-6 py-14 text-center", className)}>
      <Icon className="size-10 text-muted-foreground" />
      <div className="space-y-1">
        <p className="font-heading text-base font-medium">{title}</p>
        {description && <p className="mx-auto max-w-sm text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState(props: StateProps) {
  const t = useT();
  return <StateShell {...props} title={props.title || t("common.emptyTitle")} />;
}

export function ErrorState({ onRetry, ...props }: Partial<StateProps> & { onRetry?: () => void }) {
  const t = useT();

  return (
    <StateShell
      icon={AlertCircleIcon}
      title={props.title ?? t("common.errorTitle")}
      description={props.description ?? t("common.errorBody")}
      className={cn("[&_svg]:text-destructive", props.className)}
      action={
        onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            {t("common.retry")}
          </Button>
        ) : (
          props.action
        )
      }
    />
  );
}

/** Kartochka ro'yxati uchun skeleton — haqiqiy kartochka bilan bir o'lchamda. */
export function CardsSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-36 rounded-xl" />
      ))}
    </div>
  );
}

/** Jadval uchun skeleton. */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex gap-3">
          {Array.from({ length: columns }).map((_, column) => (
            <Skeleton key={column} className="h-10 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}
