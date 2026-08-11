"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2Icon, Loader2Icon, Volume2Icon } from "lucide-react";
import { useLessonQuery, useSaveLessonProgressMutation } from "@/store/api/lesson-api";
import { useLocale, useT } from "@/lib/i18n/provider";
import { speak } from "@/lib/speech";
import type { Award } from "@/types/api";
import { AwardDialog } from "@/components/child/award-dialog";
import { CardsSkeleton, ErrorState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";

/** Video ko'rilishi shu oraliqda bir marta serverga yoziladi. */
const PROGRESS_INTERVAL_MS = 10_000;

export default function ChildLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useT();
  const { locale } = useLocale();

  const { data: lesson, isLoading, isError, refetch } = useLessonQuery(id);
  const [saveProgress, { isLoading: saving }] = useSaveLessonProgressMutation();

  const [awards, setAwards] = useState<Award[]>([]);
  const [justCompleted, setJustCompleted] = useState(false);
  const lastSentAt = useRef(0);

  const progress = lesson?.progress?.[0];
  const completed = progress?.status === "COMPLETED" || justCompleted;

  useEffect(() => {
    if (lesson?.title) speak(lesson.title, locale);
  }, [lesson?.title, locale]);

  /** Video oqayotganda vaqti-vaqti bilan ko'rilgan foizni yuboradi. */
  const handleTimeUpdate = useCallback(
    (event: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = event.currentTarget;
      const now = Date.now();

      if (!video.duration || now - lastSentAt.current < PROGRESS_INTERVAL_MS) return;
      lastSentAt.current = now;

      const percent = Math.min(99, Math.round((video.currentTime / video.duration) * 100));

      saveProgress({
        id,
        data: { progressPercent: percent, watchedSeconds: Math.round(video.currentTime) },
      });
    },
    [id, saveProgress],
  );

  const finish = async () => {
    const result = await saveProgress({ id, data: { status: "COMPLETED" } }).unwrap().catch(() => null);

    if (!result) return;

    setJustCompleted(true);
    if (result.awards.length) setAwards(result.awards);
  };

  if (isLoading) return <CardsSkeleton count={2} className="sm:grid-cols-1" />;
  if (isError || !lesson) return <ErrorState onRetry={refetch} />;

  const images = lesson.media.filter((item) => item.type === "IMAGE");
  const audios = lesson.media.filter((item) => item.type === "AUDIO");
  const videos = lesson.media.filter((item) => item.type === "VIDEO");

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-base text-muted-foreground">
            {lesson.category.icon} {lesson.category.name}
          </p>
          <h1 className="font-heading text-3xl font-bold text-balance md:text-4xl">{lesson.title}</h1>
        </div>

        <Button
          variant="secondary"
          size="icon-lg"
          className="size-14 shrink-0 rounded-2xl"
          onClick={() => speak(`${lesson.title}. ${lesson.description ?? ""}`, locale)}
          aria-label={t("game.listenAgain")}
        >
          <Volume2Icon className="size-6" />
        </Button>
      </div>

      {lesson.description && <p className="text-xl leading-relaxed">{lesson.description}</p>}

      {lesson.videoUrl && (
        <video
          src={lesson.videoUrl}
          controls
          onTimeUpdate={handleTimeUpdate}
          className="w-full rounded-[--density-radius] bg-black"
        />
      )}

      {videos.map((item) => (
        <video key={item.id} src={item.url} controls className="w-full rounded-[--density-radius] bg-black" />
      ))}

      {(lesson.audioUrl || audios.length > 0) && (
        <div className="space-y-3">
          {lesson.audioUrl && <audio src={lesson.audioUrl} controls className="w-full" />}
          {audios.map((item) => (
            <div key={item.id} className="space-y-1">
              <audio src={item.url} controls className="w-full" />
              {item.caption && <p className="text-sm text-muted-foreground">{item.caption}</p>}
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {images.map((item) => (
            <figure key={item.id} className="overflow-hidden rounded-[--density-radius] bg-card ring-2 ring-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={item.caption ?? ""} className="w-full object-cover" />
              {item.caption && (
                <figcaption className="px-4 py-2 text-base text-muted-foreground">{item.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      )}

      <div className="sticky bottom-4 pt-4">
        {completed ? (
          <div className="flex items-center justify-center gap-2 rounded-[--density-radius] bg-success/15 p-5 text-lg font-semibold text-success ring-2 ring-success/30">
            <CheckCircle2Icon className="size-6" />
            {justCompleted ? t("lesson.completed") : t("lesson.alreadyCompleted")}
          </div>
        ) : (
          <Button size="lg" className="h-16 w-full text-xl" onClick={finish} disabled={saving}>
            {saving && <Loader2Icon className="animate-spin" />}
            ✅ {t("lesson.markComplete")}
          </Button>
        )}
      </div>

      <AwardDialog awards={awards} onClose={() => setAwards([])} />
    </div>
  );
}
