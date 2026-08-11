"use client";

import { useEffect, type ReactNode } from "react";
import { useMeQuery } from "@/store/api/auth-api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearAuth, setChildSession, setParentSession } from "@/store/slices/authSlice";
import { getToken, setSession } from "@/lib/session";
import { isChildSession } from "@/types/api";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Sahifa yangilanganda sessiyani tiklaydi: cookie'da token bo'lsa
 * `GET /auth/me` chaqiriladi va Redux to'ldiriladi.
 *
 * `kl_role` cookie'si ham shu yerda haqiqatga moslanadi — u `middleware.ts`
 * uchun yagona manba, shuning uchun serverdagi rol bilan farq qilib qolmasin.
 */
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
      // 401 bo'lsa `lib/axios.ts` allaqachon sessiyani tozalab, login'ga yuboradi.
      dispatch(clearAuth());
      return;
    }

    if (!isSuccess || !data) return;

    if (isChildSession(data)) {
      dispatch(setChildSession({ parent: data.parent, child: data.child }));
      setSession(getToken()!, "CHILD");
      return;
    }

    // `children` bu yerda kerak emas — ro'yxat `useListChildrenQuery` dan keladi.
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
