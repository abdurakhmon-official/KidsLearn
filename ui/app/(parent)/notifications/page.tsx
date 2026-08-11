"use client";

import { useState } from "react";
import { AwardIcon, BellIcon, BookOpenIcon, CheckCheckIcon, ClockAlertIcon } from "lucide-react";
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from "@/store/api/notification-api";
import { useLocale, useT } from "@/lib/i18n/provider";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { NotificationType } from "@/types/api";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/shared/states";
import { Pager } from "@/components/pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const ICONS: Record<NotificationType, typeof BellIcon> = {
  NO_ACTIVITY_TODAY: ClockAlertIcon,
  NEW_LESSON: BookOpenIcon,
  AWARD_EARNED: AwardIcon,
};

const TONES: Record<NotificationType, string> = {
  NO_ACTIVITY_TODAY: "bg-warning/15 text-warning",
  NEW_LESSON: "bg-primary/10 text-primary",
  AWARD_EARNED: "bg-medal-gold/15 text-medal-gold",
};

const PAGE_SIZE = 15;

export default function NotificationsPage() {
  const t = useT();
  const { locale } = useLocale();

  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data, isLoading, isError, refetch } = useNotificationsQuery({
    page,
    size: PAGE_SIZE,
    unreadOnly: unreadOnly || undefined,
  });

  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation();

  return (
    <>
      <PageHeader
        title={t("notification.title")}
        description={data ? t("common.totalCount", { count: data.count }) : undefined}
        action={
          <Button
            variant="outline"
            onClick={() => markAllRead()}
            disabled={markingAll || !data?.unread}
          >
            <CheckCheckIcon data-icon="inline-start" />
            {t("notification.markAllRead")}
          </Button>
        }
      />

      <div className="flex items-center gap-2">
        <Switch
          id="unread-only"
          checked={unreadOnly}
          onCheckedChange={(checked) => {
            setUnreadOnly(checked);
            setPage(1);
          }}
        />
        <Label htmlFor="unread-only">{t("notification.unreadOnly")}</Label>
      </div>

      {isLoading && <TableSkeleton rows={6} columns={1} />}
      {isError && <ErrorState onRetry={refetch} />}

      {data?.items.length === 0 && <EmptyState icon={BellIcon} title={t("notification.empty")} />}

      {data && data.items.length > 0 && (
        <>
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y">
                {data.items.map((item) => {
                  const Icon = ICONS[item.type];
                  const unread = !item.readAt;

                  return (
                    <li
                      key={item.id}
                      className={cn(
                        "flex items-start gap-3 px-4 py-3 transition-colors",
                        unread && "bg-primary/[0.04]",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-lg",
                          TONES[item.type],
                        )}
                      >
                        <Icon className="size-4" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 text-sm font-medium">
                          {item.title}
                          {unread && <span aria-hidden className="size-1.5 rounded-full bg-primary" />}
                        </p>
                        <p className="text-sm text-muted-foreground">{item.body}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatRelative(item.createdAt, locale)}
                        </p>
                      </div>

                      {unread && (
                        <Button variant="ghost" size="xs" onClick={() => markRead(item.id)}>
                          {t("notification.markAllRead").split(" ")[0]}
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          <Pager page={page} size={PAGE_SIZE} count={data.count} onPageChange={setPage} />
        </>
      )}
    </>
  );
}
