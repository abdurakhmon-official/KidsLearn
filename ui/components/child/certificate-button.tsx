"use client";

import { useState } from "react";
import { DownloadIcon, Loader2Icon } from "lucide-react";
import { useT } from "@/lib/i18n/provider";
import type { ProgressSummary } from "@/types/api";
import { Button } from "@/components/ui/button";

export function CertificateButton({
  progress,
  awardCount,
}: {
  progress: ProgressSummary;
  awardCount: number;
}) {
  const t = useT();
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);

    try {
      // jsPDF ~350KB — faqat kerak bo'lganda yuklanadi, boshlang'ich
      // bundle'ga qo'shilmaydi.
      const { downloadCertificate } = await import("@/lib/certificate");
      downloadCertificate(progress, awardCount);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button size="lg" variant="outline" className="h-14 w-full text-lg" onClick={download} disabled={busy}>
      {busy ? <Loader2Icon className="animate-spin" /> : <DownloadIcon data-icon="inline-start" />}
      📜 {t("progress.certificate")}
    </Button>
  );
}
