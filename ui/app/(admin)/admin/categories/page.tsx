"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2Icon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from "@/store/api/category-api";
import { applyServerErrors } from "@/lib/form";
import { useT } from "@/lib/i18n/provider";
import type { Category } from "@/types/api";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/shared/states";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().min(1, "Nomni kiriting"),
  slug: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  order: z.coerce.number().int().min(0),
  active: z.boolean(),
});

type Values = z.input<typeof schema>;

export default function AdminCategoriesPage() {
  const t = useT();
  // Admin nofaol fanlarni ham ko'rishi kerak.
  const { data, isLoading, isError, refetch } = useCategoriesQuery({ all: true });

  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation();

  const [editing, setEditing] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);
  const [removing, setRemoving] = useState<Category | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", slug: "", description: "", icon: "", color: "#6d51ec", order: 0, active: true },
  });

  useEffect(() => {
    if (!open) return;

    form.reset({
      name: editing?.name ?? "",
      slug: editing?.slug ?? "",
      description: editing?.description ?? "",
      icon: editing?.icon ?? "",
      color: editing?.color ?? "#6d51ec",
      order: editing?.order ?? 0,
      active: editing?.active ?? true,
    });
  }, [open, editing, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = {
      ...values,
      order: Number(values.order),
      // Bo'sh `slug` yuborilmasin — server uni `name` dan hosil qiladi.
      slug: values.slug?.trim() ? values.slug : undefined,
    };

    try {
      if (editing) {
        await updateCategory({ id: editing.id, data: payload }).unwrap();
      } else {
        await createCategory(payload).unwrap();
      }
      setOpen(false);
    } catch (error) {
      applyServerErrors(error, form.setError);
    }
  });

  const confirmDelete = async () => {
    if (!removing) return;
    await deleteCategory(removing.id).unwrap().catch(() => undefined);
    setRemoving(null);
  };

  const error = (name: keyof Values) => form.formState.errors[name]?.message;

  return (
    <>
      <PageHeader
        title={t("nav.categories")}
        action={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <PlusIcon data-icon="inline-start" />
            {t("common.add")}
          </Button>
        }
      />

      {isLoading && <TableSkeleton rows={6} columns={4} />}
      {isError && <ErrorState onRetry={refetch} />}
      {data?.length === 0 && <EmptyState title={t("common.emptyTitle")} />}

      {data && data.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("common.name")}</TableHead>
                    <TableHead>{t("admin.slug")}</TableHead>
                    <TableHead className="text-right">{t("nav.lessons")}</TableHead>
                    <TableHead className="text-right">{t("nav.games")}</TableHead>
                    <TableHead className="text-right">{t("lesson.order")}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {data.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        <span
                          className="mr-2 inline-flex size-6 items-center justify-center rounded"
                          style={{
                            backgroundColor: `color-mix(in oklch, ${category.color ?? "var(--muted)"} 20%, transparent)`,
                          }}
                        >
                          {category.icon}
                        </span>
                        {category.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{category.slug}</TableCell>
                      <TableCell className="text-right tabular-nums">{category._count.lessons}</TableCell>
                      <TableCell className="text-right tabular-nums">{category._count.games}</TableCell>
                      <TableCell className="text-right tabular-nums">{category.order}</TableCell>
                      <TableCell>
                        <Badge variant={category.active ? "secondary" : "outline"}>
                          {category.active ? t("common.active") : t("common.inactive")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={t("common.edit")}
                            onClick={() => {
                              setEditing(category);
                              setOpen(true);
                            }}
                          >
                            <PencilIcon />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={t("common.delete")}
                            onClick={() => setRemoving(category)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2Icon />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? t("common.edit") : t("common.add")}</DialogTitle>
          </DialogHeader>

          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="c-name">{t("common.name")}</Label>
              <Input id="c-name" {...form.register("name")} />
              {error("name") && <p className="text-xs text-destructive">{error("name")}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="c-slug">
                {t("admin.slug")} <span className="text-muted-foreground">({t("common.optional")})</span>
              </Label>
              <Input id="c-slug" placeholder="nomdan-hosil-boladi" {...form.register("slug")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="c-desc">{t("lesson.description")}</Label>
              <Textarea id="c-desc" rows={2} {...form.register("description")} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="c-icon">{t("admin.icon")}</Label>
                <Input id="c-icon" placeholder="🎨" maxLength={4} {...form.register("icon")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-color">{t("admin.color")}</Label>
                <Input id="c-color" type="color" className="h-9 p-1" {...form.register("color")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-order">{t("lesson.order")}</Label>
                <Input id="c-order" type="number" min={0} {...form.register("order")} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="c-active"
                checked={form.watch("active")}
                onCheckedChange={(checked) => form.setValue("active", checked)}
              />
              <Label htmlFor="c-active">{t("common.active")}</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={creating || updating}>
                {(creating || updating) && <Loader2Icon className="animate-spin" />}
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
        title={removing?.name}
        description={
          removing && removing._count.lessons + removing._count.games > 0
            ? `${removing._count.lessons} ta dars va ${removing._count.games} ta o'yin shu fanga bog'langan.`
            : undefined
        }
      />
    </>
  );
}
