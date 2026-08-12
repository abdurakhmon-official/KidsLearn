"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, XIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export type LightboxImage = {
  id: string;
  url: string;
  caption?: string | null;
};

export function ImageLightbox({
  images,
  index,
  onIndexChange,
  onClose,
}: {
  images: LightboxImage[];

  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const t = useT();

  const [zoomedId, setZoomedId] = useState<string | null>(null);

  const open = index !== null && index >= 0 && index < images.length;
  const active = open ? images[index] : null;
  const zoomed = active !== null && zoomedId === active.id;

  const toggleZoom = () => setZoomedId(zoomed ? null : (active?.id ?? null));

  const step = useCallback(
    (delta: number) => {
      if (index === null || images.length === 0) return;
      onIndexChange((index + delta + images.length) % images.length);
    },
    [index, images.length, onIndexChange],
  );

  useEffect(() => {
    if (!open || images.length < 2) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, images.length, step]);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[calc(100%-1rem)] gap-3 p-3 sm:max-w-3xl sm:p-4"
      >
        {active && (
          <>
            <div className="flex items-center gap-2">
              <DialogTitle className="min-w-0 flex-1 truncate text-lg">
                {active.caption || t("media.type.IMAGE")}
              </DialogTitle>

              {images.length > 1 && (
                <span className="shrink-0 text-base font-medium tabular-nums text-muted-foreground">
                  {(index ?? 0) + 1} / {images.length}
                </span>
              )}

              <Button
                variant="secondary"
                size="icon-lg"
                className="size-12 shrink-0 rounded-2xl"
                onClick={onClose}
                aria-label={t("common.close")}
              >
                <XIcon className="size-6" />
              </Button>
            </div>

            <div
              className={cn(
                "flex max-h-[65vh] justify-center overflow-auto rounded-xl bg-muted",
                zoomed ? "items-start" : "items-center",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={active.url}
                alt={active.caption ?? ""}
                onClick={toggleZoom}
                className={cn(
                  "select-none",
                  zoomed
                    ? "w-[200%] max-w-none cursor-zoom-out"
                    : "max-h-[65vh] w-auto max-w-full cursor-zoom-in object-contain",
                )}
              />
            </div>

            <div className="flex items-center gap-2">
              {images.length > 1 && (
                <Button
                  variant="secondary"
                  size="icon-lg"
                  className="size-14 shrink-0 rounded-2xl"
                  onClick={() => step(-1)}
                  aria-label={t("common.previous")}
                >
                  <ChevronLeftIcon className="size-7" />
                </Button>
              )}

              <Button
                variant="secondary"
                size="lg"
                className="h-14 flex-1 gap-2 rounded-2xl text-lg"
                onClick={toggleZoom}
              >
                {zoomed ? <ZoomOutIcon className="size-6" /> : <ZoomInIcon className="size-6" />}
                {zoomed ? t("lesson.zoomOut") : t("lesson.zoomIn")}
              </Button>

              {images.length > 1 && (
                <Button
                  variant="secondary"
                  size="icon-lg"
                  className="size-14 shrink-0 rounded-2xl"
                  onClick={() => step(1)}
                  aria-label={t("common.next")}
                >
                  <ChevronRightIcon className="size-7" />
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
