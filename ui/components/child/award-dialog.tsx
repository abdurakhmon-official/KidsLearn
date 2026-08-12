"use client";

import { useEffect } from "react";
import { useT } from "@/lib/i18n/provider";
import { useSpeaker } from "@/hooks/use-speaker";
import type { Award } from "@/types/api";
import { MedalCoin } from "@/components/shared/badges";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function AwardDialog({ awards, onClose }: { awards: Award[]; onClose: () => void }) {
  const t = useT();
  const speaker = useSpeaker();

  const open = awards.length > 0;

  useEffect(() => {
    if (open) speaker.sayText(`${t("award.newAward")} ${awards[0].title}`);
  }, [open, awards, speaker, t]);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent showCloseButton={false} className="sm:max-w-sm">
        <DialogTitle className="text-center font-heading text-2xl font-bold">
          🎉 {t("award.newAward")}
        </DialogTitle>

        <div className="flex flex-col items-center gap-5 py-2">
          {awards.map((award, index) => (
            <div
              key={award.id}
              className="flex animate-in flex-col items-center gap-2 text-center zoom-in-50"
              style={{ animationDelay: `${index * 150}ms`, animationFillMode: "backwards" }}
            >
              <MedalCoin medal={award.medal} icon={award.icon} size="lg" />
              <p className="font-heading text-lg font-bold">{award.title}</p>
              {award.description && (
                <p className="text-sm text-muted-foreground">{award.description}</p>
              )}
            </div>
          ))}
        </div>

        <Button size="lg" className="h-14 w-full text-lg" onClick={onClose}>
          {t("common.close")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
