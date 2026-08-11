"use client";

import { useCallback, useState } from "react";
import { useDebouncedValue } from "./use-debounced-value";

/**
 * Ro'yxat sahifalarining umumiy holati: sahifa raqami va debounce'li qidiruv.
 *
 * Qidiruv yozilganda sahifa darhol 1 ga qaytariladi — aks holda foydalanuvchi
 * 5-sahifada turib qidirsa, natija bo'lsa ham bo'sh ro'yxat ko'rinardi.
 * Bu `setSearchInput` ichida bo'ladi, effektda emas: effekt ichidagi
 * `setState` ortiqcha render zanjirini keltirib chiqaradi.
 */
export function useListState(size = 10) {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInputState] = useState("");
  const search = useDebouncedValue(searchInput, 300);

  const setSearchInput = useCallback((value: string) => {
    setSearchInputState(value);
    setPage(1);
  }, []);

  /** Filtr o'zgarganda ham sahifani boshiga qaytarish uchun. */
  const resetPage = useCallback(() => setPage(1), []);

  return { page, setPage, resetPage, searchInput, setSearchInput, search, size };
}
