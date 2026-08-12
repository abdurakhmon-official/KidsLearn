"use client";

import { useCallback } from "react";
import { useLogoutMutation } from "@/store/api/auth-api";
import { clearSession } from "@/lib/session";
import { reloadTo } from "@/lib/navigation";

export function useSignOut() {
  const [logout, { isLoading }] = useLogoutMutation();

  const signOut = useCallback(async () => {
    await logout().unwrap().catch(() => undefined);

    clearSession();
    reloadTo("/login");
  }, [logout]);

  return { signOut, isSigningOut: isLoading };
}
