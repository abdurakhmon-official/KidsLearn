"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react";
import { useLoginMutation } from "@/store/api/auth-api";
import { useCompleteSignIn } from "@/hooks/use-complete-sign-in";
import { applyServerErrors } from "@/lib/form";
import { loginSchema, type LoginValues } from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DEMO_ACCOUNTS = [
  { role: "Administrator", email: "admin@kidslearn.uz" },
  { role: "Ota-ona", email: "ota-ona@kidslearn.uz" },
];

function LoginForm() {
  const searchParams = useSearchParams();
  const [login, { isLoading }] = useLoginMutation();
  const completeSignIn = useCompleteSignIn();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const token = await login(values).unwrap();
      await completeSignIn(token, searchParams.get("next"));
    } catch (error) {
      // Maydonga tegishli bo'lmagan xatoni `lib/axios.ts` toast qiladi.
      applyServerErrors(error, form.setError);
    }
  });

  const fill = (email: string) => {
    form.setValue("email", email);
    form.setValue("password", "password123");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Xush kelibsiz</CardTitle>
        <CardDescription>Hisobingizga kiring</CardDescription>
      </CardHeader>

      <form onSubmit={onSubmit} noValidate>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(form.formState.errors.email)}
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Parol</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className="pr-9"
                aria-invalid={Boolean(form.formState.errors.password)}
                {...form.register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
                className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2Icon className="animate-spin" />}
            {isLoading ? "Kirilmoqda…" : "Kirish"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Hisobingiz yo&apos;qmi?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Ro&apos;yxatdan o&apos;tish
            </Link>
          </p>

          <div className="w-full rounded-lg bg-muted/60 p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Demo hisoblar (parol: password123)</p>
            <div className="flex flex-wrap gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <Button key={account.email} type="button" variant="outline" size="xs" onClick={() => fill(account.email)}>
                  {account.role}
                </Button>
              ))}
            </div>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function LoginPage() {
  // `useSearchParams` prerender paytida Suspense chegarasini talab qiladi.
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
