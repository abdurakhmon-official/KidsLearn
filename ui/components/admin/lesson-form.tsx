"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2Icon, PlusIcon, Trash2Icon } from "lucide-react";
import { useCreateLessonMutation, useUpdateLessonMutation } from "@/store/api/lesson-api";
import { useCategoriesQuery } from "@/store/api/category-api";
import { applyServerErrors } from "@/lib/form";
import { useT } from "@/lib/i18n/provider";
import { AGE_GROUPS, MEDIA_TYPES, type LessonDetail } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

/** Bo'sh string `undefined` ga aylantiriladi — server `.url()` bilan tekshiradi. */
const optionalUrl = z
  .string()
  .url("Manzil noto'g'ri")
  .optional()
  .or(z.literal("").transform(() => undefined));

const schema = z.object({
  title: z.string().min(1, "Nomni kiriting"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Fanni tanlang"),
  ageGroup: z.enum(["AGE_1_2", "AGE_3_4", "AGE_5_7"]),
  coverImage: optionalUrl,
  videoUrl: optionalUrl,
  audioUrl: optionalUrl,
  points: z.coerce.number().int().min(0).max(1000),
  order: z.coerce.number().int().min(0),
  active: z.boolean(),
  media: z.array(
    z.object({
      type: z.enum(["IMAGE", "VIDEO", "AUDIO"]),
      url: z.string().url("Manzil noto'g'ri"),
      caption: z.string().optional(),
      order: z.coerce.number().int().min(0),
    }),
  ),
});

type Values = z.input<typeof schema>;

export function LessonForm({ lesson }: { lesson?: LessonDetail }) {
  const t = useT();
  const router = useRouter();

  const { data: categories } = useCategoriesQuery({ all: true });
  const [createLesson, { isLoading: creating }] = useCreateLessonMutation();
  const [updateLesson, { isLoading: updating }] = useUpdateLessonMutation();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      ageGroup: "AGE_1_2",
      coverImage: "",
      videoUrl: "",
      audioUrl: "",
      points: 10,
      order: 0,
      active: true,
      media: [],
    },
  });

  const media = useFieldArray({ control: form.control, name: "media" });

  useEffect(() => {
    if (!lesson) return;

    form.reset({
      title: lesson.title,
      description: lesson.description ?? "",
      categoryId: lesson.categoryId,
      ageGroup: lesson.ageGroup,
      coverImage: lesson.coverImage ?? "",
      videoUrl: lesson.videoUrl ?? "",
      audioUrl: lesson.audioUrl ?? "",
      points: lesson.points,
      order: lesson.order,
      active: lesson.active,
      media: lesson.media.map((item) => ({
        type: item.type,
        url: item.url,
        caption: item.caption ?? "",
        order: item.order,
      })),
    });
  }, [lesson, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = {
      ...values,
      points: Number(values.points),
      order: Number(values.order),
      media: values.media.map((item) => ({ ...item, order: Number(item.order) })),
    };

    try {
      if (lesson) {
        // `media` yuborilsa server ro'yxatni **to'liq almashtiradi**.
        await updateLesson({ id: lesson.id, data: payload }).unwrap();
      } else {
        const created = await createLesson(payload).unwrap();
        router.replace(`/admin/lessons/${created.id}`);
      }
    } catch (error) {
      applyServerErrors(error, form.setError);
    }
  });

  const error = (name: string) =>
    (form.formState.errors as Record<string, { message?: string } | undefined>)[name]?.message;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>{t("nav.overview")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="l-title">{t("lesson.name")}</Label>
            <Input id="l-title" {...form.register("title")} />
            {error("title") && <p className="text-xs text-destructive">{error("title")}</p>}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="l-desc">{t("lesson.description")}</Label>
            <Textarea id="l-desc" rows={3} {...form.register("description")} />
          </div>

          <div className="space-y-2">
            <Label>{t("lesson.category")}</Label>
            <Select
              value={form.watch("categoryId")}
              onValueChange={(value) => form.setValue("categoryId", value ?? "", { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("lesson.category")} />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error("categoryId") && <p className="text-xs text-destructive">{error("categoryId")}</p>}
          </div>

          <div className="space-y-2">
            <Label>{t("lesson.ageGroup")}</Label>
            <Select
              value={form.watch("ageGroup")}
              onValueChange={(value) => form.setValue("ageGroup", (value ?? "AGE_1_2") as Values["ageGroup"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AGE_GROUPS.map((group) => (
                  <SelectItem key={group} value={group}>
                    {t(`ageGroup.${group}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="l-points">{t("lesson.points")}</Label>
            <Input id="l-points" type="number" min={0} max={1000} {...form.register("points")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="l-order">{t("lesson.order")}</Label>
            <Input id="l-order" type="number" min={0} {...form.register("order")} />
          </div>

          <div className="flex items-center gap-2 sm:col-span-2">
            <Switch
              id="l-active"
              checked={form.watch("active")}
              onCheckedChange={(checked) => form.setValue("active", checked)}
            />
            <Label htmlFor="l-active">{t("common.active")}</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("nav.media")}</CardTitle>
          <p className="text-xs text-muted-foreground">{t("admin.uploadHint")}</p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="l-cover">{t("lesson.coverImage")}</Label>
            <Input id="l-cover" placeholder="https://…" {...form.register("coverImage")} />
            {error("coverImage") && <p className="text-xs text-destructive">{error("coverImage")}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="l-video">{t("lesson.video")}</Label>
            <Input id="l-video" placeholder="https://…" {...form.register("videoUrl")} />
            {error("videoUrl") && <p className="text-xs text-destructive">{error("videoUrl")}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="l-audio">{t("lesson.audio")}</Label>
            <Input id="l-audio" placeholder="https://…" {...form.register("audioUrl")} />
            {error("audioUrl") && <p className="text-xs text-destructive">{error("audioUrl")}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>{t("lesson.images")}</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => media.append({ type: "IMAGE", url: "", caption: "", order: media.fields.length })}
          >
            <PlusIcon data-icon="inline-start" />
            {t("common.add")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {media.fields.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">{t("common.emptyTitle")}</p>
          )}

          {media.fields.map((field, index) => (
            <div key={field.id} className="flex flex-wrap items-end gap-2 rounded-lg bg-muted/40 p-3">
              <div className="w-28 space-y-1.5">
                <Label className="text-xs">{t("common.status")}</Label>
                <Select
                  value={form.watch(`media.${index}.type`)}
                  onValueChange={(value) =>
                    form.setValue(`media.${index}.type`, (value ?? "IMAGE") as "IMAGE" | "VIDEO" | "AUDIO")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEDIA_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-48 flex-1 space-y-1.5">
                <Label className="text-xs">URL</Label>
                <Input placeholder="https://…" {...form.register(`media.${index}.url`)} />
              </div>

              <div className="min-w-32 flex-1 space-y-1.5">
                <Label className="text-xs">{t("lesson.description")}</Label>
                <Input {...form.register(`media.${index}.caption`)} />
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => media.remove(index)}
                aria-label={t("common.delete")}
                className="text-destructive hover:bg-destructive/10"
              >
                <Trash2Icon />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button type="submit" disabled={creating || updating}>
          {(creating || updating) && <Loader2Icon className="animate-spin" />}
          {t("common.save")}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/lessons")}>
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
}
