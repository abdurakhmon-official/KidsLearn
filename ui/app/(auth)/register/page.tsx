"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useRegisterMutation } from "@/store/api/auth-api";
import { useCompleteSignIn } from "@/hooks/use-complete-sign-in";
import { applyServerErrors } from "@/lib/form";
import { registerSchema, type RegisterValues } from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const [register, { isLoading }] = useRegisterMutation();
  const completeSignIn = useCompleteSignIn();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "", phone: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const token = await register(values).unwrap();
      await completeSignIn(token);
    } catch (error) {
      applyServerErrors(error, form.setError);
    }
  });

  const fieldError = (name: keyof RegisterValues) => form.formState.errors[name]?.message;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Ro&apos;yxatdan o&apos;tish</CardTitle>
        <CardDescription>Ota-ona hisobini yarating va farzandlaringizni qo&apos;shing</CardDescription>
      </CardHeader>

      <form onSubmit={onSubmit} noValidate>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Ism familiya</Label>
            <Input
              id="fullName"
              autoComplete="name"
              aria-invalid={Boolean(fieldError("fullName"))}
              {...form.register("fullName")}
            />
            {fieldError("fullName") && <p className="text-xs text-destructive">{fieldError("fullName")}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(fieldError("email"))}
              {...form.register("email")}
            />
            {fieldError("email") && <p className="text-xs text-destructive">{fieldError("email")}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Telefon <span className="text-muted-foreground">(ixtiyoriy)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+998 90 123 45 67"
              aria-invalid={Boolean(fieldError("phone"))}
              {...form.register("phone")}
            />
            {fieldError("phone") && <p className="text-xs text-destructive">{fieldError("phone")}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Parol</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={Boolean(fieldError("password"))}
              {...form.register("password")}
            />
            {fieldError("password") ? (
              <p className="text-xs text-destructive">{fieldError("password")}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Kamida 6 ta belgi</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2Icon className="animate-spin" />}
            {isLoading ? "Yaratilmoqda…" : "Hisob yaratish"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Hisobingiz bormi?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Kirish
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
