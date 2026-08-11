"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2Icon } from "lucide-react";
import { useCreateUserMutation } from "@/store/api/user-api";
import { applyServerErrors } from "@/lib/form";
import { useT } from "@/lib/i18n/provider";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/** `api/inputs/user.input.ts` ning nusxasi. */
const schema = z.object({
  fullName: z.string().min(1, "Ism kiriting"),
  email: z.string().min(1, "Email kiriting").email("Email noto'g'ri"),
  password: z.string().min(6, "Parol kamida 6 ta belgi bo'lsin"),
  role: z.enum(["PARENT", "ADMIN"]),
  phone: z
    .string()
    .min(5, "Telefon raqami juda qisqa")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

type Values = z.infer<typeof schema>;

export function UserFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const [createUser, { isLoading }] = useCreateUserMutation();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", password: "", role: "PARENT", phone: "" },
  });

  useEffect(() => {
    if (open) form.reset({ fullName: "", email: "", password: "", role: "PARENT", phone: "" });
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createUser(values).unwrap();
      onOpenChange(false);
    } catch (error) {
      applyServerErrors(error, form.setError);
    }
  });

  const error = (name: keyof Values) => form.formState.errors[name]?.message;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("nav.users")}</DialogTitle>
          <DialogDescription>{t("common.add")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="u-name">{t("auth.fullName")}</Label>
            <Input id="u-name" {...form.register("fullName")} />
            {error("fullName") && <p className="text-xs text-destructive">{error("fullName")}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="u-email">{t("auth.email")}</Label>
            <Input id="u-email" type="email" {...form.register("email")} />
            {error("email") && <p className="text-xs text-destructive">{error("email")}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="u-phone">
              {t("auth.phone")} <span className="text-muted-foreground">({t("common.optional")})</span>
            </Label>
            <Input id="u-phone" type="tel" {...form.register("phone")} />
            {error("phone") && <p className="text-xs text-destructive">{error("phone")}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="u-password">{t("auth.password")}</Label>
            <Input id="u-password" type="password" {...form.register("password")} />
            {error("password") ? (
              <p className="text-xs text-destructive">{error("password")}</p>
            ) : (
              <p className="text-xs text-muted-foreground">{t("auth.passwordHint")}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t("admin.role")}</Label>
            <Select
              value={form.watch("role")}
              onValueChange={(value) => form.setValue("role", (value ?? "PARENT") as Values["role"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PARENT">{t("admin.parents")}</SelectItem>
                <SelectItem value="ADMIN">{t("admin.admins")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2Icon className="animate-spin" />}
              {t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
