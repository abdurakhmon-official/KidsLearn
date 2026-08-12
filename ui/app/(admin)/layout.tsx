import type { ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboardIcon } from "lucide-react";
import { SessionProvider } from "@/components/providers/session-provider";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { UserNav } from "@/components/parent/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>

      <div data-mode="admin" className="contents">
        <SidebarProvider>
          <AdminSidebar />
          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background/95 px-4 backdrop-blur">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <Separator orientation="vertical" className="h-5" />
                <Button variant="ghost" size="sm" render={<Link href="/dashboard" />}>
                  <LayoutDashboardIcon data-icon="inline-start" />
                  <span className="hidden sm:inline">Ota-ona kabineti</span>
                </Button>
              </div>

              <div className="flex items-center gap-1">
                <LanguageToggle />
                <ThemeToggle />
                <Separator orientation="vertical" className="mx-1 h-5" />
                <UserNav />
              </div>
            </header>

            <main className="w-full flex-1 space-y-5 p-4 md:p-6">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </SessionProvider>
  );
}
