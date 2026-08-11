import Cookies from "js-cookie";
import type { AuthRole } from "@/types/api";

export const TOKEN_COOKIE = "kl_token";
export const PARENT_TOKEN_COOKIE = "kl_parent_token";
export const ROLE_COOKIE = "kl_role";
export const LOCALE_COOKIE = "kl_locale";

const FALLBACK_DAYS = 1;

const options = (expiresInSeconds?: number): Cookies.CookieAttributes => ({
  expires: expiresInSeconds ? new Date(Date.now() + expiresInSeconds * 1000) : FALLBACK_DAYS,
  path: "/",
  sameSite: "lax",
  secure: typeof window !== "undefined" && window.location.protocol === "https:",
});

export const getToken = (): string | undefined => {
  return Cookies.get(TOKEN_COOKIE);
}

export const getRole = (): AuthRole | undefined => {
  return Cookies.get(ROLE_COOKIE) as AuthRole | undefined;
}

export const getParentToken = (): string | undefined => {
  return Cookies.get(PARENT_TOKEN_COOKIE);
}

export const hasParkedParent = (): boolean => {
  return Boolean(Cookies.get(PARENT_TOKEN_COOKIE));
}

export const setSession = (token: string, role: AuthRole, expiresInSeconds?: number) => {
  Cookies.set(TOKEN_COOKIE, token, options(expiresInSeconds));
  Cookies.set(ROLE_COOKIE, role, options(expiresInSeconds));
}

export const clearSession = () => {
  Cookies.remove(TOKEN_COOKIE, { path: "/" });
  Cookies.remove(PARENT_TOKEN_COOKIE, { path: "/" });
  Cookies.remove(ROLE_COOKIE, { path: "/" });
}

export const enterChildMode = (childToken: string, expiresInSeconds?: number) => {
  const parentToken = getToken();

  if (parentToken) {
    Cookies.set(PARENT_TOKEN_COOKIE, parentToken, options(expiresInSeconds));
  }

  setSession(childToken, "CHILD", expiresInSeconds);
}

export const exitChildMode = (role: AuthRole = "PARENT"): boolean => {
  const parentToken = getParentToken();

  if (!parentToken) {
    clearSession();
    return false;
  }

  Cookies.remove(PARENT_TOKEN_COOKIE, { path: "/" });
  setSession(parentToken, role);

  return true;
}

export const getLocale = (): string | undefined => {
  return Cookies.get(LOCALE_COOKIE);
}

export const setLocale = (locale: string) => {
  Cookies.set(LOCALE_COOKIE, locale, { expires: 365, path: "/", sameSite: "lax" });
}
