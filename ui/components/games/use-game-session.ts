"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { usePlayGameQuery, useSubmitGameMutation } from "@/store/api/game-api";
import type { GameMove, SubmitGameResult } from "@/types/api";

export function useGameSession(gameId: string) {
  const { data: round, isLoading, isError, refetch } = usePlayGameQuery(gameId);
  const [submitGame, { isLoading: submitting }] = useSubmitGameMutation();

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [result, setResult] = useState<SubmitGameResult | null>(null);

  const startedAt = useRef<number | null>(null);

  const items = useMemo(() => round?.items ?? [], [round]);
  const total = items.length;
  const current = items[index];
  const isLast = index >= total - 1;

  const submit = useCallback(
    async (finalAnswers: Record<string, string | null>, moves: GameMove[]) => {
      if (!round) return;

      const payload = items.map((item) => ({
        itemId: item.id,
        value: finalAnswers[item.id] ?? null,
      }));

      const durationSeconds = Math.round((Date.now() - (startedAt.current ?? Date.now())) / 1000);

      const response = await submitGame({
        id: gameId,
        data: { roundId: round.roundId, answers: payload, moves, durationSeconds },
      })
        .unwrap()
        .catch(() => null);

      if (response) setResult(response);
    },
    [gameId, items, round, submitGame],
  );

  const answer = useCallback(
    (value: string | null, moves: GameMove[] = []) => {
      if (!current) return;

      const next = { ...answers, [current.id]: value };
      setAnswers(next);

      if (isLast) {
        void submit(next, moves);
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
