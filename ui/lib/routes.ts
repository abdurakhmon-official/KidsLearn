import type { AuthRole } from "@/types/api";

export const ROLE_HOME: Record<AuthRole, string> = {
  ADMIN: "/admin",
  PARENT: "/dashboard",
  CHILD: "/play",
};

export const PARENT_PATHS = [
  "/dashboard",
  "/children",
  "/notifications",
  "/leaderboard",
  "/profile",
  "/settings",
  "/select-child",
];

export const CHILD_PATHS = ["/play"];

export const ADMIN_PATHS = ["/admin"];

export const PROTECTED_PATHS = [...PARENT_PATHS, ...CHILD_PATHS, ...ADMIN_PATHS];

export const AUTH_PATHS = ["/login", "/register"];

const startsWithAny = (pathname: string, paths: string[]) =>
  paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

export const isProtectedPath = (pathname: string) => startsWithAny(pathname, PROTECTED_PATHS);
export const isAuthPath = (pathname: string) => startsWithAny(pathname, AUTH_PATHS);

export const canAccess = (role: AuthRole, pathname: string): boolean => {
  if (role === "CHILD") {
    return startsWithAny(pathname, CHILD_PATHS);
  }

  if (role === "ADMIN") {
    return startsWithAny(pathname, [...ADMIN_PATHS, ...PARENT_PATHS]);
  }

  return startsWithAny(pathname, PARENT_PATHS);
}
