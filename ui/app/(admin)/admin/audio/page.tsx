"use client";

import { useState } from "react";
import { Volume2Icon } from "lucide-react";
import {
  usePhraseAudioPaginatedQuery,
  useRemovePhraseAudioMutation,
  useUpsertPhraseAudioMutation,
} from "@/store/api/audio-api";
import { LOCALES, LOCALE_LABELS, useT, type Locale } from "@/lib/i18n/provider";
import { SPOKEN_PHRASE_KEYS } from "@/lib/audio/phrase-keys";
import { uz } from "@/lib/i18n/dictionaries/uz";
import { en } from "@/lib/i18n/dictionaries/en";
import { ru } from "@/lib/i18n/dictionaries/ru";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState, TableSkeleton } from "@/components/shared/states";
import { MediaUpload } from "@/components/shared/media-upload";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const DICTIONARIES = { uz, en, ru };

const PAGE_SIZE = 100;

export default function AdminAudioPage() {
  const t = useT();
  const [locale, setLocale] = useState<Locale>("uz");

  const { data, isLoading, isError, refetch } = usePhraseAudioPaginatedQuery({
    page: 1,
    size: PAGE_SIZE,
    locale,
  });

  const [upsertPhraseAudio] = useUpsertPhraseAudioMutation();
  const [removePhraseAudio] = useRemovePhraseAudioMutation();

  const existing = new Map((data?.items ?? []).map((row) => [row.key, row]));

  const save = async (key: string, text: string, url: string) => {
    const current = existing.get(key);

    if (!url) {
      if (current) await removePhraseAudio(current.id).unwrap().catch(() => undefined);
      return;
    }

    await upsertPhraseAudio({ key, locale, text, url }).unwrap().catch(() => undefined);
  };

  return (
    <>
      <PageHeader title={t("audio.title")} description={t("audio.description")} />

      <div className="flex items-end gap-3">
        <div className="space-y-2">
          <Label htmlFor="audio-locale" className="text-xs">
            {t("audio.localeHint")}
          </Label>
          <Select value={locale} onValueChange={(value) => setLocale((value ?? "uz") as Locale)}>
            <SelectTrigger id="audio-locale" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LOCALES.map((value) => (
                <SelectItem key={value} value={value}>
                  {LOCALE_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && <TableSkeleton rows={6} columns={4} />}
      {isError && <ErrorState onRetry={refetch} />}

      {data && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("audio.phrase")}</TableHead>
                    <TableHead>{t("audio.text")}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead className="min-w-72">{t("nav.audio")}</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {SPOKEN_PHRASE_KEYS.map((key) => {
                    const text = DICTIONARIES[locale][key] ?? uz[key] ?? key;
                    const row = existing.get(key);

                    return (
                      <TableRow key={key}>
                        <TableCell className="font-mono text-xs text-muted-foreground">{key}</TableCell>
                        <TableCell className="font-medium">{text}</TableCell>
                        <TableCell>
                          {row ? (
                            <Badge variant="secondary">
                              <Volume2Icon className="size-3.5" />
                              {t("audio.recorded")}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">{t("audio.generated")}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <MediaUpload
                            kind="audio"
                            folder="phrases"
                            compact
                            value={row?.url ?? ""}
                            onChange={(url) => void save(key, text, url)}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
