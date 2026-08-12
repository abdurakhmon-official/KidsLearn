import { NextResponse, type NextRequest } from "next/server";
import { ROLE_COOKIE, TOKEN_COOKIE } from "@/lib/session";
import { ROLE_HOME, canAccess, isAuthPath, isProtectedPath } from "@/lib/routes";
import type { AuthRole } from "@/types/api";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const role = request.cookies.get(ROLE_COOKIE)?.value as AuthRole | undefined;

  const signedIn = Boolean(token && role);

  if (!signedIn) {
    if (isProtectedPath(pathname)) {
      const url = new URL("/login", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  const home = ROLE_HOME[role!];

  if (isAuthPath(pathname) || pathname === "/") {
    return NextResponse.redirect(new URL(home, request.url));
  }

  if (isProtectedPath(pathname) && !canAccess(role!, pathname)) {
    return NextResponse.redirect(new URL(home, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/dashboard/:path*",
    "/children/:path*",
    "/notifications/:path*",
    "/leaderboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/select-child/:path*",
    "/play/:path*",
    "/admin/:path*",
  ],
};
