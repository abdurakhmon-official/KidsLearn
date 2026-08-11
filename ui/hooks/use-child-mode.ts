"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useLogoutMutation, useSelectChildMutation } from "@/store/api/auth-api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setChildSession, setParentSession } from "@/store/slices/authSlice";
import { baseApi } from "@/store/api/base-api";
import { clearSession, enterChildMode, exitChildMode } from "@/lib/session";
import { ROLE_HOME } from "@/lib/routes";

export function useChildMode() {
  const router = useRouter();
  const dispatch = useAppDispatch();
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
        dispatch(setChildSession({ parent: user!, child: session.child }));
        dispatch(baseApi.util.resetApiState());

        router.replace(ROLE_HOME.CHILD);
        router.refresh();
      } finally {
        setPendingChildId(null);
      }
    },
    [dispatch, router, selectChild, user],
  );

  const exit = useCallback(async () => {
    await logout().unwrap().catch(() => undefined);

    const isAdmin = user?.role === "ADMIN";
    const restored = exitChildMode(isAdmin ? "ADMIN" : "PARENT");

    dispatch(baseApi.util.resetApiState());

    if (!restored) {
      clearSession();
      router.replace("/login");
      router.refresh();
      return;
    }

    if (user) {
      dispatch(setParentSession({ user, isAdmin }));
    }

    router.replace("/select-child");
    router.refresh();
  }, [dispatch, logout, router, user]);

  return { enter, exit, pendingChildId };
}
