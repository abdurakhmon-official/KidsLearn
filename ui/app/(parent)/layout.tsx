import type { ReactNode } from "react";
import { SessionProvider } from "@/components/providers/session-provider";
import { ParentSidebar } from "@/components/parent/parent-sidebar";
import { UserNav } from "@/components/parent/user-nav";
import { NotificationBell } from "@/components/parent/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function ParentLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <SidebarProvider>
        <ParentSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background/95 px-4 backdrop-blur">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-5" />
            </div>

            <div className="flex items-center gap-1">
              <NotificationBell />
              <LanguageToggle />
              <ThemeToggle />
              <Separator orientation="vertical" className="mx-1 h-5" />
              <UserNav />
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-4 md:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </SessionProvider>
  );
}
