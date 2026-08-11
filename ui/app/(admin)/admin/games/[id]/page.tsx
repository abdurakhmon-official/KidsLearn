"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { useGameQuery } from "@/store/api/game-api";
import { useT } from "@/lib/i18n/provider";
import { PageHeader } from "@/components/shared/page-header";
import { GameForm } from "@/components/admin/game-form";
import { CardsSkeleton, ErrorState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";

export default function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useT();

  const { data, isLoading, isError, refetch } = useGameQuery(id);

  return (
    <>
      <PageHeader
        title={data?.title ?? t("nav.games")}
        description={data ? t(`game.type.${data.code}`) : undefined}
        action={
          <Button variant="outline" size="sm" render={<Link href="/admin/games" />}>
            <ArrowLeftIcon data-icon="inline-start" />
            {t("common.back")}
          </Button>
        }
      />

      {isLoading && <CardsSkeleton count={2} className="sm:grid-cols-1" />}
      {isError && <ErrorState onRetry={refetch} />}
      {data && <GameForm game={data} />}
    </>
  );
}
