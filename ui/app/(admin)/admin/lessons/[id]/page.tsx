"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { useLessonQuery } from "@/store/api/lesson-api";
import { useT } from "@/lib/i18n/provider";
import { PageHeader } from "@/components/shared/page-header";
import { LessonForm } from "@/components/admin/lesson-form";
import { CardsSkeleton, ErrorState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";

export default function EditLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useT();

  const { data, isLoading, isError, refetch } = useLessonQuery(id);

  return (
    <>
      <PageHeader
        title={data?.title ?? t("nav.lessons")}
        action={
          <Button variant="outline" size="sm" render={<Link href="/admin/lessons" />}>
            <ArrowLeftIcon data-icon="inline-start" />
            {t("common.back")}
          </Button>
        }
      />

      {isLoading && <CardsSkeleton count={2} className="sm:grid-cols-1" />}
      {isError && <ErrorState onRetry={refetch} />}
      {data && <LessonForm lesson={data} />}
    </>
  );
}
