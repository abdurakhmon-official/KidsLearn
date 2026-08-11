"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileAudioIcon, FileVideoIcon, ImageIcon, Loader2Icon, PlusIcon, Trash2Icon } from "lucide-react";
import { useMediaPaginatedQuery, useRegisterMediaMutation, useRemoveMediaMutation } from "@/store/api/media-api";
import { useListState } from "@/hooks/use-list-state";
import { applyServerErrors } from "@/lib/form";
import { useLocale, useT } from "@/lib/i18n/provider";
import { formatBytes, formatDate } from "@/lib/format";
import { MEDIA_TYPES, type MediaAsset, type MediaType } from "@/types/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataToolbar } from "@/components/shared/data-toolbar";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/shared/states";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Pager } from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ALL = "all";

const ICONS: Record<MediaType, typeof ImageIcon> = {
  IMAGE: ImageIcon,
  VIDEO: FileVideoIcon,
  AUDIO: FileAudioIcon,
};

const schema = z.object({
  type: z.enum(["IMAGE", "VIDEO", "AUDIO"]),
  url: z.string().url("Manzil noto'g'ri"),
  key: z.string().min(1, "S3 kalitini kiriting"),
  originalName: z.string().min(1, "Fayl nomini kiriting"),
  mimeType: z.string().min(1, "MIME turini kiriting"),
  size: z.coerce.number().int().min(0),
});

type Values = z.input<typeof schema>;

export default function AdminMediaPage() {
  const t = useT();
  const { locale } = useLocale();
  const { page, setPage, resetPage, searchInput, setSearchInput, search, size } = useListState();

  const [type, setType] = useState<string>(ALL);
  const [open, setOpen] = useState(false);
  const [removing, setRemoving] = useState<MediaAsset | null>(null);

  const { data, isLoading, isError, refetch } = useMediaPaginatedQuery({
    page,
    size,
    search: search || undefined,
    type: type === ALL ? undefined : (type as MediaType),
  });

  const [registerMedia, { isLoading: registering }] = useRegisterMediaMutation();
  const [removeMedia, { isLoading: deleting }] = useRemoveMediaMutation();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { type: "IMAGE", url: "", key: "", originalName: "", mimeType: "image/png", size: 0 },
  });

  useEffect(() => {
    if (open) form.reset({ type: "IMAGE", url: "", key: "", originalName: "", mimeType: "image/png", size: 0 });
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await registerMedia({ ...values, size: Number(values.size) }).unwrap();
      setOpen(false);
    } catch (error) {
      applyServerErrors(error, form.setError);
    }
  });

  const confirmDelete = async () => {
    if (!removing) return;
    await removeMedia(removing.id).unwrap().catch(() => undefined);
    setRemoving(null);
  };

  const error = (name: keyof Values) => form.formState.errors[name]?.message;

  return (
    <>
      <PageHeader
        title={t("nav.media")}
        description={t("admin.uploadHint")}
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            <PlusIcon data-icon="inline-start" />
            {t("common.add")}
          </Button>
        }
      />

      <DataToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        filters={
          <Select
            value={type}
            onValueChange={(value) => {
              setType(value ?? ALL);
              resetPage();
            }}
          >
            <SelectTrigger className="w-36" aria-label={t("common.status")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t("common.all")}</SelectItem>
              {MEDIA_TYPES.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {isLoading && <TableSkeleton rows={6} columns={5} />}
      {isError && <ErrorState onRetry={refetch} />}
      {data?.count === 0 && <EmptyState icon={ImageIcon} title={t("common.emptyTitle")} />}

      {data && data.count > 0 && (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("common.name")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                      <TableHead className="text-right">{t("common.name")}</TableHead>
                      <TableHead>{t("common.date")}</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {data.items.map((asset) => {
                      const Icon = ICONS[asset.type];

                      return (
                        <TableRow key={asset.id}>
                          <TableCell>
                            <a
                              href={asset.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 font-medium hover:underline"
                            >
                              <Icon className="size-4 shrink-0 text-muted-foreground" />
                              <span className="truncate">{asset.originalName}</span>
                            </a>
                            <span className="block truncate font-mono text-xs text-muted-foreground">
                              {asset.key}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{asset.type}</Badge>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{formatBytes(asset.size)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(asset.createdAt, locale)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={t("common.delete")}
                              onClick={() => setRemoving(asset)}
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2Icon />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Pager page={page} size={size} count={data.count} onPageChange={setPage} />
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("nav.media")}</DialogTitle>
            <DialogDescription>
              Fayl S3 ga yuklangandan keyin uni registrga yozadi.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <div className="space-y-2">
              <Label>{t("common.status")}</Label>
              <Select
                value={form.watch("type")}
                onValueChange={(value) => form.setValue("type", (value ?? "IMAGE") as MediaType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEDIA_TYPES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="m-url">URL</Label>
              <Input id="m-url" placeholder="https://…" {...form.register("url")} />
              {error("url") && <p className="text-xs text-destructive">{error("url")}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="m-key">S3 key</Label>
              <Input id="m-key" placeholder="lessons/20260811/rasm.png" {...form.register("key")} />
              {error("key") && <p className="text-xs text-destructive">{error("key")}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="m-name">{t("common.name")}</Label>
                <Input id="m-name" {...form.register("originalName")} />
                {error("originalName") && <p className="text-xs text-destructive">{error("originalName")}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="m-mime">MIME</Label>
                <Input id="m-mime" {...form.register("mimeType")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="m-size">Size (bytes)</Label>
              <Input id="m-size" type="number" min={0} {...form.register("size")} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={registering}>
                {registering && <Loader2Icon className="animate-spin" />}
                {t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(removing)}
        onOpenChange={(next) => !next && setRemoving(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title={removing?.originalName}
      />
    </>
  );
}
