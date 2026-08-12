"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const PREFERRED_TYPES = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg"];

function pickMimeType() {
  if (typeof MediaRecorder === "undefined") return undefined;

  return PREFERRED_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
}

export function isRecordingSupported() {
  return (
    typeof window !== "undefined" &&
    typeof MediaRecorder !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia)
  );
}

export type RecorderError = "recorder.denied" | "recorder.failed";

export function useRecorder(onDone: (file: File) => void) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<RecorderError | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (!recording) return;

    const timer = setInterval(() => setSeconds((value) => value + 1), 1000);

    return () => clearInterval(timer);
  }, [recording]);

  const stop = useCallback(() => {
    recorderRef.current?.stop();
  }, []);

  const start = useCallback(async () => {
    if (!isRecordingSupported()) {
      setError("recorder.failed");
      return;
    }

    setError(null);
    setSeconds(0);

    let stream: MediaStream;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    } catch {
      setError("recorder.denied");
      return;
    }

    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

    chunksRef.current = [];
    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size) chunksRef.current.push(event.data);
    };

    recorder.onstop = () => {
      for (const track of stream.getTracks()) track.stop();

      setRecording(false);
      recorderRef.current = null;

      const type = (mimeType ?? "audio/webm").split(";")[0];
      const blob = new Blob(chunksRef.current, { type });

      if (!blob.size) {
        setError("recorder.failed");
        return;
      }

      const extension = type === "audio/mp4" ? "m4a" : type === "audio/ogg" ? "ogg" : "webm";

      onDoneRef.current(new File([blob], `record-${Date.now()}.${extension}`, { type }));
    };

    recorder.start();
    setRecording(true);
  }, []);

  useEffect(() => {
    return () => {
      const recorder = recorderRef.current;

      if (recorder && recorder.state !== "inactive") recorder.stop();
    };
  }, []);

  return { recording, seconds, error, start, stop, clearError: () => setError(null) };
}
