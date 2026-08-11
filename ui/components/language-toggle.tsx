"use client";

import { LanguagesIcon } from "lucide-react";
import { LOCALES, LOCALE_LABELS, useLocale } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Tilni tanlash">
            <LanguagesIcon />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {LOCALES.map((value) => (
          <DropdownMenuItem key={value} onClick={() => setLocale(value)} data-active={value === locale}>
            <span className={value === locale ? "font-medium" : undefined}>{LOCALE_LABELS[value]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
