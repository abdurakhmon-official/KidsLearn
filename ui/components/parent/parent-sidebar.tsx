"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BellIcon,
  LayoutDashboardIcon,
  ShieldIcon,
  SparklesIcon,
  TrophyIcon,
  UserRoundIcon,
  UsersRoundIcon,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { useT } from "@/lib/i18n/provider";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

export function ParentSidebar() {
  const pathname = usePathname();
  const t = useT();
  const isAdmin = useAppSelector((state) => state.auth.role === "ADMIN");

  const items = [
    { href: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboardIcon },
    { href: "/children", label: t("nav.children"), icon: UsersRoundIcon },
    { href: "/notifications", label: t("nav.notifications"), icon: BellIcon },
    { href: "/leaderboard", label: t("nav.leaderboard"), icon: TrophyIcon },
    { href: "/profile", label: t("nav.profile"), icon: UserRoundIcon },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2 px-2 py-1.5">
          <SparklesIcon className="size-5 shrink-0 text-primary" />
          <span className="truncate font-heading text-lg font-semibold group-data-[collapsible=icon]:hidden">
            KidsLearn
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/admin" />}
                    isActive={pathname.startsWith("/admin")}
                    tooltip={t("nav.adminPanel")}
                  >
                    <ShieldIcon />
                    <span>{t("nav.adminPanel")}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
