"use client";

import Link from "next/link";
import { BellIcon } from "lucide-react";
import { useNotificationsQuery } from "@/store/api/notification-api";
import { useT } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/button";

/** Header'dagi qo'ng'iroq — o'qilmaganlar soni bilan. */
export function NotificationBell() {
  const t = useT();

  // Faqat sanoq kerak, shuning uchun eng kichik sahifa so'raladi.
  const { data } = useNotificationsQuery(
    { page: 1, size: 1 },
    { pollingInterval: 60_000, refetchOnMountOrArgChange: true },
  );

  const unread = data?.unread ?? 0;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      aria-label={`${t("notification.title")}${unread ? ` (${unread})` : ""}`}
      render={<Link href="/notifications" />}
    >
      <BellIcon />
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-4 text-white tabular-nums">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Button>
  );
}
