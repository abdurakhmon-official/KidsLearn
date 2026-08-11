"use client";

import { useTheme } from "next-themes";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { LOCALES, LOCALE_LABELS, useLocale, useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  const t = useT();
  const { locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: "light", label: t("settings.themeLight"), icon: SunIcon },
    { value: "dark", label: t("settings.themeDark"), icon: MoonIcon },
    { value: "system", label: t("settings.themeSystem"), icon: MonitorIcon },
  ];

  return (
    <>
      <PageHeader title={t("nav.settings")} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.language")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {LOCALES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setLocale(value)}
                aria-pressed={locale === value}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm transition-colors",
                  locale === value
                    ? "bg-primary/10 font-medium text-primary ring-2 ring-primary"
                    : "bg-muted hover:bg-accent",
                )}
              >
                {LOCALE_LABELS[value]}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("settings.theme")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {themes.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setTheme(item.value)}
                aria-pressed={theme === item.value}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  theme === item.value
                    ? "bg-primary/10 font-medium text-primary ring-2 ring-primary"
                    : "bg-muted hover:bg-accent",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
