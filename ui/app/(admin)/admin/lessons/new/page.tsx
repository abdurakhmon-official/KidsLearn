"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { useT } from "@/lib/i18n/provider";
import { PageHeader } from "@/components/shared/page-header";
import { LessonForm } from "@/components/admin/lesson-form";
import { Button } from "@/components/ui/button";

export default function NewLessonPage() {
  const t = useT();

  return (
    <>
      <PageHeader
        title={`${t("nav.lessons")} · ${t("common.create")}`}
        action={
          <Button variant="outline" size="sm" render={<Link href="/admin/lessons" />}>
            <ArrowLeftIcon data-icon="inline-start" />
            {t("common.back")}
          </Button>
        }
      />
      <LessonForm />
    </>
  );
}
