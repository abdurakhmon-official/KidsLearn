"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2Icon } from "lucide-react";
import { useLessonsForChildQuery } from "@/store/api/lesson-api";
import { useCategoriesQuery } from "@/store/api/category-api";
import { useLocale, useT } from "@/lib/i18n/provider";
import { speak } from "@/lib/speech";
import { cn } from "@/lib/utils";
import { CardsSkeleton, EmptyState, ErrorState } from "@/components/shared/states";

export default function ChildLessonsPage() {
  const t = useT();
  const { locale } = useLocale();
  const [categoryId, setCategoryId] = useState<string | undefined>();

  const { data: categories } = useCategoriesQuery();
  const { data, isLoading, isError, refetch } = useLessonsForChildQuery(
    categoryId ? { categoryId } : undefined,
  );

  // Faqat bolaning ro'yxatida uchraydigan fanlar chip sifatida ko'rsatiladi.
  const visible = categories?.filter((category) => category._count.lessons > 0) ?? [];

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-bold md:text-4xl">📚 {t("lesson.title")}</h1>

      {visible.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategoryId(undefined)}
            aria-pressed={!categoryId}
            className={cn(
              "rounded-full px-4 py-2.5 text-base font-medium transition-colors",
              !categoryId ? "bg-primary text-primary-foreground" : "bg-card ring-1 ring-border hover:bg-accent",
            )}
          >
            {t("common.all")}
          </button>

          {visible.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setCategoryId(category.id)}
              aria-pressed={categoryId === category.id}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-2.5 text-base font-medium transition-colors",
                categoryId === category.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card ring-1 ring-border hover:bg-accent",
              )}
            >
              <span aria-hidden>{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      )}

      {isLoading && <CardsSkeleton count={4} />}
      {isError && <ErrorState onRetry={refetch} />}
      {data?.items.length === 0 && <EmptyState title={t("lesson.empty")} />}

      {data && data.items.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((lesson) => {
            const done = lesson.progress.status === "COMPLETED";
            const percent = lesson.progress.progressPercent;

            return (
              <Link
                key={lesson.id}
                href={`/play/lessons/${lesson.id}`}
                onClick={() => speak(lesson.title, locale)}
                className="group relative flex flex-col gap-3 overflow-hidden rounded-[--density-radius] bg-card p-5 ring-2 ring-border transition-transform hover:ring-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring active:scale-95"
              >
                {/* Seed'da muqova rasmi yo'q — fan emoji'si rangli fonda fallback bo'ladi. */}
                <span
                  className="flex h-28 items-center justify-center rounded-xl text-6xl"
                  style={{ backgroundColor: `color-mix(in oklch, ${lesson.category.color ?? "var(--muted)"} 15%, transparent)` }}
                  aria-hidden
                >
                  {lesson.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={lesson.coverImage} alt="" className="size-full rounded-xl object-cover" />
                  ) : (
                    (lesson.category.icon ?? "📘")
                  )}
                </span>

                <div className="space-y-1">
                  <p className="font-heading text-lg font-bold leading-tight">{lesson.title}</p>
                  <p className="text-sm text-muted-foreground">{lesson.category.name}</p>
                </div>

                {done ? (
                  <p className="flex items-center gap-1.5 text-sm font-medium text-success">
                    <CheckCircle2Icon className="size-5" />
                    {t("lesson.completed")}
                  </p>
                ) : percent > 0 ? (
                  <div className="space-y-1">
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground tabular-nums">{percent}%</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">⭐ {lesson.points}</p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
