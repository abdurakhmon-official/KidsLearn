"use client";

import { useState } from "react";
import { PlusIcon, Trash2Icon } from "lucide-react";
import {
  useDeleteUserMutation,
  useUpdateUserStatusMutation,
  useUsersPaginatedQuery,
} from "@/store/api/user-api";
import { useListState } from "@/hooks/use-list-state";
import { useLocale, useT } from "@/lib/i18n/provider";
import { formatDate } from "@/lib/format";
import type { UserListItem, UserRole } from "@/types/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataToolbar } from "@/components/shared/data-toolbar";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/shared/states";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { UserFormDialog } from "@/components/admin/user-form-dialog";
import { Pager } from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ALL = "all";

export default function AdminUsersPage() {
  const t = useT();
  const { locale } = useLocale();
  const { page, setPage, resetPage, searchInput, setSearchInput, search, size } = useListState();

  const [role, setRole] = useState<string>(ALL);
  const [formOpen, setFormOpen] = useState(false);
  const [removing, setRemoving] = useState<UserListItem | null>(null);

  const { data, isLoading, isError, refetch } = useUsersPaginatedQuery({
    page,
    size,
    search: search || undefined,
    role: role === ALL ? undefined : (role as UserRole),
  });

  const roleOptions = [
    { value: ALL, label: t("common.all") },
    { value: "PARENT", label: t("admin.parents") },
    { value: "ADMIN", label: t("admin.admins") },
  ];

  const [updateStatus] = useUpdateUserStatusMutation();
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();

  const confirmDelete = async () => {
    if (!removing) return;
    await deleteUser(removing.id).unwrap().catch(() => undefined);
    setRemoving(null);
  };

  return (
    <>
      <PageHeader
        title={t("nav.users")}
        action={
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <PlusIcon data-icon="inline-start" />
            {t("common.add")}
          </Button>
        }
      />

      <DataToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        placeholder={`${t("auth.fullName")}, ${t("auth.email")}, ${t("child.fullName")}…`}
        filters={
          <Select
            value={role}
            onValueChange={(value) => {
              setRole(value ?? ALL);
              resetPage();
            }}
            items={roleOptions}
          >
            <SelectTrigger className="w-36" aria-label={t("admin.role")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {isLoading && <TableSkeleton rows={6} columns={5} />}
      {isError && <ErrorState onRetry={refetch} />}
      {data?.count === 0 && <EmptyState title={t("common.emptyTitle")} />}

      {data && data.count > 0 && (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("auth.fullName")}</TableHead>
                      <TableHead>{t("auth.email")}</TableHead>
                      <TableHead>{t("admin.role")}</TableHead>
                      <TableHead className="text-right">{t("admin.childCount")}</TableHead>
                      <TableHead>{t("common.date")}</TableHead>
                      <TableHead>{t("common.active")}</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {data.items.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.fullName}</TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{user.role}</Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{user._count.children}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(user.createdAt, locale)}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={user.active}
                            onCheckedChange={(checked) => updateStatus({ id: user.id, active: checked })}
                            aria-label={t("common.status")}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setRemoving(user)}
                            aria-label={t("common.delete")}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2Icon />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Pager page={page} size={size} count={data.count} onPageChange={setPage} />
        </>
      )}

      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} />

      <ConfirmDialog
        open={Boolean(removing)}
        onOpenChange={(open) => !open && setRemoving(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title={removing?.fullName}
      />
    </>
  );
}
