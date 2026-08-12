export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
export const UPLOAD_KINDS = ["image", "audio", "video"] as const;
export type UploadKind = (typeof UPLOAD_KINDS)[number];

export const UPLOAD_ACCEPT: Record<UploadKind, string[]> = {
  image: ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"],
  video: ["video/mp4", "video/webm"],
  audio: [
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/x-wav",
    "audio/ogg",
    "audio/webm",
    "audio/mp4",
    "audio/aac",
  ],
};

export function checkFile(file: File, kind: UploadKind): "upload.tooLarge" | "upload.wrongType" | null {
  if (file.size > MAX_UPLOAD_BYTES) return "upload.tooLarge";

  const mimeType = file.type.split(";")[0].trim().toLowerCase();

  if (mimeType && !UPLOAD_ACCEPT[kind].includes(mimeType)) return "upload.wrongType";

  return null;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
