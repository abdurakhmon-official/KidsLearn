"use client";

import { useEffect, type ReactNode } from "react";
import { useMeQuery } from "@/store/api/auth-api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearAuth, setChildSession, setParentSession } from "@/store/slices/authSlice";
import { getToken, setSession } from "@/lib/session";
import { isChildSession } from "@/types/api";
import { Skeleton } from "@/components/ui/skeleton";

export function SessionProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const initialized = useAppSelector((state) => state.auth.initialized);

  const hasToken = typeof window !== "undefined" && Boolean(getToken());
  const { data, isError, isSuccess } = useMeQuery(undefined, { skip: !hasToken });

  useEffect(() => {
    if (!hasToken) {
      dispatch(clearAuth());
      return;
    }

    if (isError) {
      dispatch(clearAuth());
      return;
    }

    if (!isSuccess || !data) return;

    if (isChildSession(data)) {
      dispatch(setChildSession({ parent: data.parent, child: data.child }));
      setSession(getToken()!, "CHILD");
      return;
    }

    const { children: _ignored, isAdmin, ...user } = data;
    void _ignored;
    dispatch(setParentSession({ user, isAdmin }));
    setSession(getToken()!, isAdmin ? "ADMIN" : "PARENT");
  }, [dispatch, hasToken, isError, isSuccess, data]);

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
