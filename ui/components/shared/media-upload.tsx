"use client";

import { useRef, useState } from "react";
import {
  FileIcon,
  ImageIcon,
  Loader2Icon,
  MicIcon,
  MusicIcon,
  PlayIcon,
  SquareIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import { useUploadMediaMutation } from "@/store/api/media-api";
import { isRecordingSupported, useRecorder } from "@/hooks/use-recorder";
import { processAudioFile } from "@/lib/audio/process";
import { useT } from "@/lib/i18n/provider";
import { UPLOAD_ACCEPT, checkFile, formatBytes, type UploadKind } from "@/lib/upload";
import { cn } from "@/lib/utils";
import type { UploadFolder } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const KIND_ICONS = { image: ImageIcon, audio: MusicIcon, video: FileIcon } as const;

export function MediaUpload({
  id,
  label,
  hint,
  kind,
  folder,
  value,
  onChange,
  placeholder = "https://…",
  compact,
  className,
}: {
  id?: string;
  label?: string;
  hint?: string;
  kind: UploadKind;
  folder: UploadFolder;
  value: string | undefined;
  onChange: (url: string) => void;
  placeholder?: string;
  compact?: boolean;
  className?: string;
}) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLAudioElement>(null);

  const [uploadMedia, { isLoading: sending }] = useUploadMediaMutation();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<{ name: string; size: number } | null>(null);

  const KindIcon = KIND_ICONS[kind];

  const isLoading = processing || sending;

  const upload = async (chosen: File) => {
    const problem = checkFile(chosen, kind);

    if (problem) {
      setError(t(problem));
      return;
    }

    setError(null);

    let file = chosen;

    if (kind === "audio") {
      setProcessing(true);

      try {
        file = (await processAudioFile(chosen)).file;
      } finally {
        setProcessing(false);
      }
    }

    try {
      const asset = await uploadMedia({ folder, file }).unwrap();

      onChange(asset.url);
      setUploaded({ name: asset.originalName, size: asset.size });
    } catch {
      setError(t("upload.failed"));
    }
  };

  const pick = async (file: File | undefined) => {
    if (!file) return;

    await upload(file);

    if (inputRef.current) inputRef.current.value = "";
  };

  const recorder = useRecorder((file) => void upload(file));

  const clear = () => {
    onChange("");
    setUploaded(null);
    setError(null);
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <Label htmlFor={id} className="text-xs">
          {label}
        </Label>
      )}

      <div className="flex flex-wrap items-center gap-2">

        {kind === "image" && value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            onError={() => setError(t("upload.previewFailed"))}
            className="size-8 shrink-0 rounded-md border border-border object-cover"
          />
        )}

        <Input
          id={id}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-40 flex-1"
        />

        <input
          ref={inputRef}
          type="file"
          accept={UPLOAD_ACCEPT[kind].join(",")}
          className="hidden"
          onChange={(event) => pick(event.target.files?.[0])}
        />

        <Button
          type="button"
          variant="outline"
          size={compact ? "icon-sm" : "sm"}
          disabled={isLoading}
          onClick={() => inputRef.current?.click()}
          aria-label={compact ? t("upload.choose") : undefined}
          title={compact ? t("upload.choose") : undefined}
        >
          {isLoading ? (
            <Loader2Icon data-icon={compact ? undefined : "inline-start"} className="animate-spin" />
          ) : (
            <UploadIcon data-icon={compact ? undefined : "inline-start"} />
          )}
          {!compact &&
            (processing
              ? t("upload.processing")
              : sending
                ? t("upload.uploading")
                : value
                  ? t("upload.replace")
                  : t("upload.choose"))}
        </Button>

        {kind === "audio" && isRecordingSupported() && (
          <Button
            type="button"
            variant={recorder.recording ? "default" : "outline"}
            size={compact ? "icon-sm" : "sm"}
            disabled={isLoading}
            onClick={() => (recorder.recording ? recorder.stop() : void recorder.start())}
            aria-label={recorder.recording ? t("upload.stopRecording") : t("upload.record")}
            title={recorder.recording ? t("upload.stopRecording") : t("upload.record")}
          >
            {recorder.recording ? (
              <SquareIcon data-icon={compact ? undefined : "inline-start"} />
            ) : (
              <MicIcon data-icon={compact ? undefined : "inline-start"} />
            )}
            {!compact &&
              (recorder.recording ? `${t("upload.stopRecording")} ${recorder.seconds}s` : t("upload.record"))}
          </Button>
        )}

        {kind === "audio" && value && (
          <>
            <audio ref={previewRef} src={value} preload="none" />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={t("game.listenAgain")}
              onClick={() => previewRef.current?.play().catch(() => setError(t("upload.previewFailed")))}
            >
              <PlayIcon />
            </Button>
          </>
        )}

        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t("upload.remove")}
            onClick={clear}
            className="text-destructive hover:bg-destructive/10"
          >
            <Trash2Icon />
          </Button>
        )}
      </div>

      {uploaded && !compact && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <KindIcon className="size-3.5 shrink-0" />
          <span className="truncate">{uploaded.name}</span>
          <span className="tabular-nums">({formatBytes(uploaded.size)})</span>
        </p>
      )}

      {recorder.recording && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <span className="size-2 shrink-0 animate-pulse rounded-full bg-destructive" />
          {t("upload.recording")} {recorder.seconds}s
        </p>
      )}

      {hint && !error && !recorder.error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {recorder.error && <p className="text-xs text-destructive">{t(recorder.error)}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
