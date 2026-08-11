"use client";

import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Ikkala ikonka ham chiziladi, ko'rinadigani CSS bilan tanlanadi
 * (`dark:` varianti). Shu sababli "mounted" holati kerak emas — server va
 * klient bir xil markup beradi, hydration mos keladi va ikonka miltillamaydi.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Mavzuni almashtirish"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <SunIcon className="hidden dark:block" />
      <MoonIcon className="block dark:hidden" />
    </Button>
  );
}
