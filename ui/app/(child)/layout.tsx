import type { ReactNode } from "react";
import { SessionProvider } from "@/components/providers/session-provider";
import { ChildHeader } from "@/components/child/child-header";

export default function ChildLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      {/* `data-mode="child"` zichlik token'larini yoqadi: kattaroq radius,
          matn va boshqaruv elementlari. */}
      <div
        data-mode="child"
        className="flex min-h-screen flex-col bg-[radial-gradient(ellipse_at_top,var(--accent),var(--background))]"
      >
        <ChildHeader />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-12 md:px-6">{children}</main>
      </div>
    </SessionProvider>
  );
}
