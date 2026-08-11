"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLazyMeQuery } from "@/store/api/auth-api";
import { useAppDispatch } from "@/store/hooks";
import { setChildSession, setParentSession } from "@/store/slices/authSlice";
import { setSession } from "@/lib/session";
import { ROLE_HOME, canAccess } from "@/lib/routes";
import { isChildSession, type AccessToken } from "@/types/api";

export function useCompleteSignIn() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [getMe] = useLazyMeQuery();

  return useCallback(
    async (token: AccessToken, next?: string | null) => {
      setSession(token.accessToken, "PARENT", token.expiresIn);

      const me = await getMe().unwrap();

      if (isChildSession(me)) {
        setSession(token.accessToken, "CHILD", token.expiresIn);
        dispatch(setChildSession({ parent: me.parent, child: me.child }));
        router.replace(ROLE_HOME.CHILD);
        router.refresh();
        return;
      }

      const { children, isAdmin, ...user } = me;
      const role = isAdmin ? "ADMIN" : "PARENT";

      setSession(token.accessToken, role, token.expiresIn);
      dispatch(setParentSession({ user, isAdmin }));

      const requested = next && canAccess(role, next) ? next : null;
      const fallback = isAdmin ? ROLE_HOME.ADMIN : children.length ? "/select-child" : "/children";

      router.replace(requested ?? fallback);
      router.refresh();
    },
    [dispatch, getMe, router],
  );
}
