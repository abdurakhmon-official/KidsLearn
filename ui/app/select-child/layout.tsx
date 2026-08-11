import type { ReactNode } from "react";
import { SessionProvider } from "@/components/providers/session-provider";

export default function SelectChildLayout({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
