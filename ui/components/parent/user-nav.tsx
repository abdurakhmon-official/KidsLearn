"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDownIcon,
  Loader2Icon,
  LogOutIcon,
  SettingsIcon,
  ShieldIcon,
  UserRoundIcon,
  UsersRoundIcon,
} from "lucide-react";
import { useLogoutMutation } from "@/store/api/auth-api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearAuth } from "@/store/slices/authSlice";
import { baseApi } from "@/store/api/base-api";
import { clearSession } from "@/lib/session";
import { useT } from "@/lib/i18n/provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const initialsOf = (name?: string) =>
  name
    ? name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

export function UserNav() {
  const t = useT();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = useAppSelector((state) => state.auth.role === "ADMIN");

  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const initials = initialsOf(user?.fullName);
  const roleLabel = isAdmin ? t("nav.roleAdmin") : t("nav.roleParent");

  const signOut = async () => {
    await logout().unwrap().catch(() => undefined);
    clearSession();
    dispatch(clearAuth());
    dispatch(baseApi.util.resetApiState());
    router.replace("/login");
    router.refresh();
  };

  return (
    <DropdownMenu>

      <DropdownMenuTrigger className="group flex items-center gap-2 rounded-full border border-transparent py-1 pr-1 pl-1 text-sm outline-none transition-colors hover:border-border hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:border-border data-popup-open:bg-muted sm:pr-2">
        <Avatar className="size-7">
          <AvatarFallback className="bg-primary/10 font-semibold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>

        <span className="hidden min-w-0 flex-col items-start leading-tight sm:flex">
          <span className="max-w-36 truncate font-medium">{user?.fullName}</span>
          <span className="max-w-36 truncate text-[11px] font-normal text-muted-foreground">
            {roleLabel}
          </span>
        </span>

        <ChevronDownIcon className="hidden size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-data-popup-open:rotate-180 sm:block" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-64 p-1.5">

        <div className="flex items-center gap-3 px-1.5 py-2">
          <Avatar className="size-9">
            <AvatarFallback className="bg-primary/10 font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.fullName}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="px-1.5 pb-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary ring-1 ring-primary/20">
            {isAdmin && <ShieldIcon className="size-3" />}
            {roleLabel}
          </span>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {isAdmin && (
            <DropdownMenuItem render={<Link href="/admin" />}>
              <ShieldIcon />
              {t("nav.adminPanel")}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem render={<Link href="/select-child" />}>
            <UsersRoundIcon />
            {t("child.selectTitle")}
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/profile" />}>
            <UserRoundIcon />
            {t("nav.profile")}
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/settings" />}>
            <SettingsIcon />
            {t("nav.settings")}
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={signOut}
          closeOnClick={false}
          disabled={isLoggingOut}
          variant="destructive"
        >
          {isLoggingOut ? <Loader2Icon className="animate-spin" /> : <LogOutIcon />}
          {isLoggingOut ? t("nav.loggingOut") : t("nav.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
