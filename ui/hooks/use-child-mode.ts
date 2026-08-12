"use client";

import { useCallback, useState } from "react";
import { useLogoutMutation, useSelectChildMutation } from "@/store/api/auth-api";
import { useAppSelector } from "@/store/hooks";
import { enterChildMode, exitChildMode } from "@/lib/session";
import { reloadTo } from "@/lib/navigation";
import { ROLE_HOME } from "@/lib/routes";

export function useChildMode() {
  const user = useAppSelector((state) => state.auth.user);

  const [selectChild] = useSelectChildMutation();
  const [logout] = useLogoutMutation();
  const [pendingChildId, setPendingChildId] = useState<string | null>(null);

  const enter = useCallback(
    async (childId: string) => {
      setPendingChildId(childId);

      try {
        const session = await selectChild(childId).unwrap();

        enterChildMode(session.accessToken, session.expiresIn);
        reloadTo(ROLE_HOME.CHILD);
      } catch {
        setPendingChildId(null);
      }
    },
    [selectChild],
  );

  const exit = useCallback(async () => {
    await logout().unwrap().catch(() => undefined);

    const restored = exitChildMode(user?.role === "ADMIN" ? "ADMIN" : "PARENT");

    reloadTo(restored ? "/select-child" : "/login");
  }, [logout, user]);

  return { enter, exit, pendingChildId };
}
