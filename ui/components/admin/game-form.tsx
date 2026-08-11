"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2Icon, PlusIcon, Trash2Icon } from "lucide-react";
import { useCreateGameMutation, useUpdateGameMutation } from "@/store/api/game-api";
import { useCategoriesQuery } from "@/store/api/category-api";
import { applyServerErrors } from "@/lib/form";
import { useT } from "@/lib/i18n/provider";
import { AGE_GROUPS, GAME_TYPES, type GameDetail, type GameType } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const NO_CATEGORY = "none";

const optionalUrl = z
  .string()
  .url("Manzil noto'g'ri")
  .optional()
  .or(z.literal("").transform(() => undefined));

const optionSchema = z.object({
  value: z.string().min(1, "Qiymat kiriting"),
  label: z.string().optional(),
  image: optionalUrl,
  color: z.string().optional(),
});

const itemSchema = z
  .object({
    promptText: z.string().optional(),
    promptImage: optionalUrl,
    promptAudio: optionalUrl,
    correctValue: z.string().min(1, "To'g'ri javobni tanlang"),
    options: z.array(optionSchema).min(1, "Kamida bitta variant kerak"),
    order: z.coerce.number().int().min(0),
    active: z.boolean(),
  })
  // Server ham shu qoidani tekshiradi — mos kelmasa 400 qaytaradi.
  .refine((item) => item.options.some((option) => option.value === item.correctValue), {
    message: "To'g'ri javob variantlar ichida bo'lishi kerak",
    path: ["correctValue"],
  });

const schema = z.object({
  code: z.enum(["COLOR_MATCH", "ANIMAL_SOUND", "LETTER_MATCH", "NUMBER_MATCH", "PUZZLE", "MEMORY"]),
  title: z.string().min(1, "Nomni kiriting"),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  ageGroup: z.enum(["AGE_1_2", "AGE_3_4", "AGE_5_7"]),
  coverImage: optionalUrl,
  instructionAudio: optionalUrl,
  pointsPerCorrect: z.coerce.number().int().min(0).max(100),
  order: z.coerce.number().int().min(0),
  active: z.boolean(),
  rows: z.coerce.number().int().min(2).max(5).optional(),
  cols: z.coerce.number().int().min(2).max(5).optional(),
  pairs: z.coerce.number().int().min(2).max(8).optional(),
  itemsPerRound: z.coerce.number().int().min(1).max(50).optional(),
  items: z.array(itemSchema),
});

type Values = z.input<typeof schema>;

export function GameForm({ game }: { game?: GameDetail }) {
  const t = useT();
  const router = useRouter();

  const { data: categories } = useCategoriesQuery({ all: true });
  const [createGame, { isLoading: creating }] = useCreateGameMutation();
  const [updateGame, { isLoading: updating }] = useUpdateGameMutation();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "COLOR_MATCH",
      title: "",
      description: "",
      categoryId: NO_CATEGORY,
      ageGroup: "AGE_1_2",
      coverImage: "",
      instructionAudio: "",
      pointsPerCorrect: 5,
      order: 0,
      active: true,
      rows: 3,
      cols: 3,
      pairs: 6,
      items: [],
    },
  });

  const items = useFieldArray({ control: form.control, name: "items" });
  const code = form.watch("code");

  useEffect(() => {
    if (!game) return;

    const config = game.config ?? {};

    form.reset({
      code: game.code,
      title: game.title,
      description: game.description ?? "",
      categoryId: game.categoryId ?? NO_CATEGORY,
      ageGroup: game.ageGroup,
      coverImage: game.coverImage ?? "",
      instructionAudio: game.instructionAudio ?? "",
      pointsPerCorrect: game.pointsPerCorrect,
      order: game.order,
      active: game.active,
      rows: Number(config.rows) || 3,
      cols: Number(config.cols) || 3,
      pairs: Number(config.pairs) || 6,
      itemsPerRound: config.itemsPerRound ? Number(config.itemsPerRound) : undefined,
      items:
        game.items?.map((item) => ({
          promptText: item.promptText ?? "",
          promptImage: item.promptImage ?? "",
          promptAudio: item.promptAudio ?? "",
          correctValue: item.correctValue,
          options: item.options.map((option) => ({
            value: option.value,
            label: option.label ?? "",
            image: option.image ?? "",
            color: option.color ?? "",
          })),
          order: item.order,
          active: item.active,
        })) ?? [],
    });
  }, [game, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const { rows, cols, pairs, itemsPerRound, categoryId, ...fields } = values;

    // `config` turga qarab yig'iladi — xom JSON muharriri emas.
    const config: Record<string, number> = {};
    if (values.code === "PUZZLE") {
      config.rows = Number(rows) || 3;
      config.cols = Number(cols) || 3;
    }
    if (values.code === "MEMORY") config.pairs = Number(pairs) || 6;
    if (itemsPerRound) config.itemsPerRound = Number(itemsPerRound);

    const payload = {
      ...fields,
      categoryId: categoryId === NO_CATEGORY ? null : categoryId,
      pointsPerCorrect: Number(values.pointsPerCorrect),
      order: Number(values.order),
      config: Object.keys(config).length ? config : null,
      items: values.items.map((item) => ({ ...item, order: Number(item.order) })),
    };

    try {
      if (game) {
        // `items` yuborilsa server ro'yxatni to'liq almashtiradi.
        await updateGame({ id: game.id, data: payload }).unwrap();
      } else {
        const created = await createGame(payload).unwrap();
        router.replace(`/admin/games/${created.id}`);
      }
    } catch (error) {
      applyServerErrors(error, form.setError);
    }
  });

  const error = (path: string) =>
    (form.formState.errors as Record<string, { message?: string } | undefined>)[path]?.message;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>{t("nav.overview")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="g-title">{t("common.name")}</Label>
            <Input id="g-title" {...form.register("title")} />
            {error("title") && <p className="text-xs text-destructive">{error("title")}</p>}
          </div>

          <div className="space-y-2">
            <Label>{t("nav.games")}</Label>
            <Select
              value={code}
              onValueChange={(value) => form.setValue("code", (value ?? "COLOR_MATCH") as GameType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GAME_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(`game.type.${type}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="g-desc">{t("lesson.description")}</Label>
            <Textarea id="g-desc" rows={2} {...form.register("description")} />
          </div>

          <div className="space-y-2">
            <Label>{t("lesson.category")}</Label>
            <Select
              value={form.watch("categoryId")}
              onValueChange={(value) => form.setValue("categoryId", value ?? NO_CATEGORY)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CATEGORY}>{t("common.none")}</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Label htmlFor="g-points">{t("lesson.points")}</Label>
            <Input id="g-points" type="number" min={0} max={100} {...form.register("pointsPerCorrect")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="g-order">{t("lesson.order")}</Label>
            <Input id="g-order" type="number" min={0} {...form.register("order")} />
          </div>

          <div className="flex items-center gap-2 sm:col-span-2">
            <Switch
              id="g-active"
              checked={form.watch("active")}
              onCheckedChange={(checked) => form.setValue("active", checked)}
            />
            <Label htmlFor="g-active">{t("common.active")}</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Config</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {code === "PUZZLE" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="g-rows">rows</Label>
                <Input id="g-rows" type="number" min={2} max={5} {...form.register("rows")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="g-cols">cols</Label>
                <Input id="g-cols" type="number" min={2} max={5} {...form.register("cols")} />
              </div>
            </>
          )}

          {code === "MEMORY" && (
            <div className="space-y-2">
              <Label htmlFor="g-pairs">pairs</Label>
              <Input id="g-pairs" type="number" min={2} max={8} {...form.register("pairs")} />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="g-round">
              itemsPerRound <span className="text-muted-foreground">({t("common.optional")})</span>
            </Label>
            <Input id="g-round" type="number" min={1} max={50} {...form.register("itemsPerRound")} />
          </div>

          <div className="space-y-2 sm:col-span-3">
            <Label htmlFor="g-audio">{t("lesson.audio")}</Label>
            <Input id="g-audio" placeholder="https://…" {...form.register("instructionAudio")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>
            {t("admin.questions")} ({items.fields.length})
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              items.append({
                promptText: "",
                promptImage: "",
                promptAudio: "",
                correctValue: "",
                options: [{ value: "", label: "", image: "", color: "" }],
                order: items.fields.length,
                active: true,
              })
            }
          >
            <PlusIcon data-icon="inline-start" />
            {t("common.add")}
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {items.fields.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">{t("game.noContent")}</p>
          )}

          {items.fields.map((field, index) => (
            <ItemEditor key={field.id} index={index} form={form} onRemove={() => items.remove(index)} />
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button type="submit" disabled={creating || updating}>
          {(creating || updating) && <Loader2Icon className="animate-spin" />}
          {t("common.save")}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/games")}>
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
}

/** Bitta savol: prompt, variantlar massivi va ular ichidan to'g'ri javob. */
function ItemEditor({
  index,
  form,
  onRemove,
}: {
  index: number;
  form: ReturnType<typeof useForm<Values>>;
  onRemove: () => void;
}) {
  const t = useT();
  const options = useFieldArray({ control: form.control, name: `items.${index}.options` });

  const currentOptions = form.watch(`items.${index}.options`) ?? [];
  const correctError = form.formState.errors.items?.[index]?.correctValue?.message;

  return (
    <div className="space-y-3 rounded-lg bg-muted/40 p-4">
      <div className="flex items-start gap-2">
        <div className="flex-1 space-y-1.5">
          <Label className="text-xs">{t("admin.prompt")}</Label>
          <Input {...form.register(`items.${index}.promptText`)} />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          aria-label={t("common.delete")}
          className="mt-6 text-destructive hover:bg-destructive/10"
        >
          <Trash2Icon />
        </Button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">promptImage</Label>
          <Input placeholder="https://…" {...form.register(`items.${index}.promptImage`)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">promptAudio</Label>
          <Input placeholder="https://…" {...form.register(`items.${index}.promptAudio`)} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">{t("admin.options")}</Label>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => options.append({ value: "", label: "", image: "", color: "" })}
          >
            <PlusIcon data-icon="inline-start" />
            {t("admin.addOption")}
          </Button>
        </div>

        {options.fields.map((option, optionIndex) => (
          <div key={option.id} className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="value"
              className="w-28"
              {...form.register(`items.${index}.options.${optionIndex}.value`)}
            />
            <Input
              placeholder="label"
              className="w-32"
              {...form.register(`items.${index}.options.${optionIndex}.label`)}
            />
            <Input
              type="color"
              className="h-9 w-14 p-1"
              {...form.register(`items.${index}.options.${optionIndex}.color`)}
            />
            <Input
              placeholder="image URL"
              className="min-w-40 flex-1"
              {...form.register(`items.${index}.options.${optionIndex}.image`)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => options.remove(optionIndex)}
              aria-label={t("common.delete")}
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2Icon />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">{t("admin.correctAnswer")}</Label>
        {/* Erkin matn emas — faqat mavjud variantlardan tanlanadi. */}
        <Select
          value={form.watch(`items.${index}.correctValue`)}
          onValueChange={(value) =>
            form.setValue(`items.${index}.correctValue`, value ?? "", { shouldValidate: true })
          }
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder={t("admin.correctAnswer")} />
          </SelectTrigger>
          <SelectContent>
            {currentOptions
              .filter((option) => option.value)
              .map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label || option.value}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {correctError && <p className="text-xs text-destructive">{correctError}</p>}
      </div>
    </div>
  );
}
