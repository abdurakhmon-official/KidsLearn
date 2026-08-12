"use client";

import { useCallback, useState } from "react";
import { useDebouncedValue } from "./use-debounced-value";

export function useListState(size = 10) {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInputState] = useState("");
  const search = useDebouncedValue(searchInput, 300);

  const setSearchInput = useCallback((value: string) => {
    setSearchInputState(value);
    setPage(1);
  }, []);

  const resetPage = useCallback(() => setPage(1), []);

  return { page, setPage, resetPage, searchInput, setSearchInput, search, size };
}
