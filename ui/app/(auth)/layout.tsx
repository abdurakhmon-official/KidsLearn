import type { ReactNode } from "react";
import Link from "next/link";
import { SparklesIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="flex items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <SparklesIcon className="size-5 text-primary" />
          <span>KidsLearn</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
