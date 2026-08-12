"use client";

import { useEffect } from "react";
import { enableAudioOnFirstGesture, stopSpeaking } from "@/lib/audio";

export function AudioProvider() {
  useEffect(() => {
    enableAudioOnFirstGesture();

    const onHide = () => {
      if (document.visibilityState === "hidden") stopSpeaking();
    };

    document.addEventListener("visibilitychange", onHide);

    return () => {
      document.removeEventListener("visibilitychange", onHide);
      stopSpeaking();
    };
  }, []);

  return null;
}
