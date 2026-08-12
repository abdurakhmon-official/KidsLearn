"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useCreateChildMutation, useUpdateChildMutation } from "@/store/api/child-api";
import { applyServerErrors } from "@/lib/form";
import { CHILD_AVATARS, childSchema, type ChildValues } from "@/lib/validation/child";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import type { ChildProfile } from "@/types/api";
import { BirthDateSelect } from "@/components/shared/birth-date-select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const toDateInput = (value?: string) => (value ? value.slice(0, 10) : "");

export function ChildFormDialog({
  open,
  onOpenChange,
  child,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  child?: ChildProfile | null;
}) {
  const t = useT();
  const [createChild, { isLoading: creating }] = useCreateChildMutation();
  const [updateChild, { isLoading: updating }] = useUpdateChildMutation();

  const isEdit = Boolean(child);
  const isLoading = creating || updating;

  const form = useForm<ChildValues>({
    resolver: zodResolver(childSchema),
    defaultValues: { fullName: "", birthDate: "", avatar: CHILD_AVATARS[0] },
  });

  useEffect(() => {
    if (!open) return;

    form.reset({
      fullName: child?.fullName ?? "",
      birthDate: toDateInput(child?.birthDate),
      avatar: child?.avatar ?? CHILD_AVATARS[0],
    });
  }, [open, child, form]);

  const avatar = form.watch("avatar");

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (child) {
        await updateChild({ id: child.id, data: values }).unwrap();
      } else {
        await createChild(values).unwrap();
      }

      onOpenChange(false);
    } catch (error) {
      applyServerErrors(error, form.setError);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("child.editChild") : t("child.addChild")}</DialogTitle>
          <DialogDescription>
            {t("child.age")} — {t("child.birthDate").toLowerCase()} asosida avtomatik aniqlanadi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="child-name">{t("child.fullName")}</Label>
            <Input
              id="child-name"
              aria-invalid={Boolean(form.formState.errors.fullName)}
              {...form.register("fullName")}
            />
            {form.formState.errors.fullName && (
              <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="child-birth">{t("child.birthDate")}</Label>
            <BirthDateSelect
              id="child-birth"
              value={form.watch("birthDate")}

              onChange={(value) =>
                form.setValue("birthDate", value, { shouldValidate: form.formState.isSubmitted })
              }
              invalid={Boolean(form.formState.errors.birthDate)}
              disabled={isLoading}
            />
            {form.formState.errors.birthDate && (
              <p className="text-xs text-destructive">{form.formState.errors.birthDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t("child.avatar")}</Label>
            <div className="grid grid-cols-8 gap-1.5">
              {CHILD_AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => form.setValue("avatar", emoji)}
                  aria-label={emoji}
                  aria-pressed={avatar === emoji}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg text-lg transition-colors",
                    avatar === emoji ? "bg-primary/15 ring-2 ring-primary" : "bg-muted hover:bg-accent",
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2Icon className="animate-spin" />}
              {isEdit ? t("common.save") : t("common.add")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
