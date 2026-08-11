"use client";

import { useEffect } from "react";

/**
 * Service worker'ni ro'yxatdan o'tkazadi. Faqat production'da — dev'da
 * cache HMR bilan urishib qoladi.
 */
export function PwaProvider() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    };

    // Sahifa yuklanib bo'lgach — birinchi bo'yoqni sekinlashtirmasin.
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }
  }, []);

  return null;
}
