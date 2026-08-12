"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, TriangleAlertIcon } from "lucide-react";
import { useUpdatePasswordMutation, useUpdateProfileMutation } from "@/store/api/auth-api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearAuth, updateUser } from "@/store/slices/authSlice";
import { baseApi } from "@/store/api/base-api";
import { clearSession } from "@/lib/session";
import { applyServerErrors } from "@/lib/form";
import {
  updatePasswordSchema,
  updateProfileSchema,
  type UpdatePasswordValues,
  type UpdateProfileValues,
} from "@/lib/validation/auth";
import { useT } from "@/lib/i18n/provider";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
  const t = useT();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [updateProfile, { isLoading: savingProfile }] = useUpdateProfileMutation();
  const [updatePassword, { isLoading: savingPassword }] = useUpdatePasswordMutation();

  const profileForm = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { fullName: "", phone: "" },
  });

  const passwordForm = useForm<UpdatePasswordValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({ fullName: user.fullName, phone: user.phone ?? "" });
    }
  }, [user, profileForm]);

  const onSaveProfile = profileForm.handleSubmit(async (values) => {
    try {
      const updated = await updateProfile(values).unwrap();
      dispatch(updateUser(updated));
    } catch (error) {
      applyServerErrors(error, profileForm.setError);
    }
  });

  const onChangePassword = passwordForm.handleSubmit(async (values) => {
    try {
      await updatePassword({ oldPassword: values.oldPassword, newPassword: values.newPassword }).unwrap();

      clearSession();
      dispatch(clearAuth());
      dispatch(baseApi.util.resetApiState());
      router.replace("/login");
      router.refresh();
    } catch (error) {
      applyServerErrors(error, passwordForm.setError);
    }
  });

  return (
    <>
      <PageHeader title={t("nav.profile")} description={user?.email} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("nav.profile")}</CardTitle>
          </CardHeader>

          <form onSubmit={onSaveProfile} noValidate className="flex flex-1 flex-col gap-(--card-spacing)">
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">{t("auth.fullName")}</Label>
                <Input id="fullName" {...profileForm.register("fullName")} />
                {profileForm.formState.errors.fullName && (
                  <p className="text-xs text-destructive">{profileForm.formState.errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t("auth.phone")}</Label>
                <Input id="phone" type="tel" {...profileForm.register("phone")} />
                {profileForm.formState.errors.phone && (
                  <p className="text-xs text-destructive">{profileForm.formState.errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input id="email" value={user?.email ?? ""} disabled readOnly />
              </div>
            </CardContent>

            <CardFooter className="mt-auto border-t">
              <Button type="submit" disabled={savingProfile}>
                {savingProfile && <Loader2Icon className="animate-spin" />}
                {t("common.save")}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("auth.changePassword")}</CardTitle>
            <CardDescription className="flex items-start gap-1.5 text-warning">
              <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0" />
              {t("auth.passwordWarning")}
            </CardDescription>
          </CardHeader>

          <form onSubmit={onChangePassword} noValidate className="flex flex-1 flex-col gap-(--card-spacing)">
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="oldPassword">{t("auth.currentPassword")}</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  autoComplete="current-password"
                  {...passwordForm.register("oldPassword")}
                />
                {passwordForm.formState.errors.oldPassword && (
                  <p className="text-xs text-destructive">{passwordForm.formState.errors.oldPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">{t("auth.newPassword")}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  {...passwordForm.register("newPassword")}
                />
                {passwordForm.formState.errors.newPassword ? (
                  <p className="text-xs text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">{t("auth.passwordHint")}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...passwordForm.register("confirmPassword")}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
            </CardContent>

            <CardFooter className="mt-auto border-t">
              <Button type="submit" variant="outline" disabled={savingPassword}>
                {savingPassword && <Loader2Icon className="animate-spin" />}
                {t("auth.changePassword")}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
}
