"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { usePlayGameQuery, useSubmitGameMutation } from "@/store/api/game-api";
import type { SubmitGameResult } from "@/types/api";

/**
 * O'yin raundining umumiy mantiqi.
 *
 * **Muhim:** `GET /games/:id/play` javobida `correctValue` yo'q — to'g'ri
 * javob hech qachon brauzerga yuborilmaydi. Shuning uchun har savoldan keyin
 * "to'g'ri/xato" ko'rsatib bo'lmaydi: javoblar to'planadi va faqat
 * `submit()` dan keyin, serverdan kelgan `results[]` bilan ochiladi.
 */
export function useGameSession(gameId: string) {
  const { data: round, isLoading, isError, refetch } = usePlayGameQuery(gameId);
  const [submitGame, { isLoading: submitting }] = useSubmitGameMutation();

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [result, setResult] = useState<SubmitGameResult | null>(null);

  // `Date.now()` render paytida chaqirilmaydi — birinchi javobda yoziladi.
  const startedAt = useRef<number | null>(null);

  const items = useMemo(() => round?.items ?? [], [round]);
  const total = items.length;
  const current = items[index];
  const isLast = index >= total - 1;

  const submit = useCallback(
    async (finalAnswers: Record<string, string | null>) => {
      const payload = items.map((item) => ({
        itemId: item.id,
        value: finalAnswers[item.id] ?? null,
      }));

      const durationSeconds = Math.round((Date.now() - (startedAt.current ?? Date.now())) / 1000);

      const response = await submitGame({ id: gameId, data: { answers: payload, durationSeconds } })
        .unwrap()
        .catch(() => null);

      if (response) setResult(response);
    },
    [gameId, items, submitGame],
  );

  /** Javobni yozadi va keyingi savolga o'tadi; oxirgisida yuboradi. */
  const answer = useCallback(
    (value: string | null) => {
      if (!current) return;

      const next = { ...answers, [current.id]: value };
      setAnswers(next);

      if (isLast) {
        void submit(next);
      } else {
        setIndex((position) => position + 1);
      }
    },
    [answers, current, isLast, submit],
  );

  const restart = useCallback(() => {
    setIndex(0);
    setAnswers({});
    setResult(null);
    startedAt.current = Date.now();
    refetch();
  }, [refetch]);

  return {
    round,
    items,
    current,
    index,
    total,
    isLast,
    answers,
    answer,
    result,
    restart,
    isLoading,
    isError,
    submitting,
    refetch,
  };
}
