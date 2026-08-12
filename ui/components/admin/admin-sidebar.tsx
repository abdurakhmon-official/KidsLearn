"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenIcon,
  GamepadIcon,
  ImageIcon,
  LayoutDashboardIcon,
  ShapesIcon,
  ShieldIcon,
  UserRoundIcon,
  UsersRoundIcon,
  Volume2Icon
} from "lucide-react";
import { useT } from "@/lib/i18n/provider";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

export function AdminSidebar() {
  const pathname = usePathname();
  const t = useT();

  const content = [
    { href: "/admin", label: t("nav.dashboard"), icon: LayoutDashboardIcon, exact: true },
    { href: "/admin/categories", label: t("nav.categories"), icon: ShapesIcon },
    { href: "/admin/lessons", label: t("nav.lessons"), icon: BookOpenIcon },
    { href: "/admin/games", label: t("nav.games"), icon: GamepadIcon },
    { href: "/admin/media", label: t("nav.media"), icon: ImageIcon },
    { href: "/admin/audio", label: t("nav.audio"), icon: Volume2Icon },
  ];

  const people = [
    { href: "/admin/users", label: t("nav.users"), icon: UsersRoundIcon },
    { href: "/admin/children", label: t("admin.children"), icon: UserRoundIcon },
  ];

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href="/admin" className="flex items-center gap-2 px-2 py-1.5">
          <ShieldIcon className="size-5 shrink-0 text-primary" />
          <span className="truncate font-heading text-lg font-semibold group-data-[collapsible=icon]:hidden">
            KidsLearn
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("nav.overview")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {content.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={isActive(item.href, item.exact)}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("nav.users")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {people.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
