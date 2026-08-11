"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { useT } from "@/lib/i18n/provider";
import { PageHeader } from "@/components/shared/page-header";
import { GameForm } from "@/components/admin/game-form";
import { Button } from "@/components/ui/button";

export default function NewGamePage() {
  const t = useT();

  return (
    <>
      <PageHeader
        title={`${t("nav.games")} · ${t("common.create")}`}
        action={
          <Button variant="outline" size="sm" render={<Link href="/admin/games" />}>
            <ArrowLeftIcon data-icon="inline-start" />
            {t("common.back")}
          </Button>
        }
      />
      <GameForm />
    </>
  );
}
