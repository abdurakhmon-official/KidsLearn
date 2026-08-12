import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import Providers from "@/store/Providers";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { PwaProvider } from "@/components/providers/pwa-provider";
import { AudioProvider } from "@/components/providers/audio-provider";
import { LocaleProvider } from "@/lib/i18n/provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "KidsLearn",
    template: "%s · KidsLearn",
  },
  description: "1–7 yoshdagi bolalar uchun interaktiv ta'lim platformasi",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "KidsLearn", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9f8fc" },
    { media: "(prefers-color-scheme: dark)", color: "#201e27" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (

    <html lang="uz" suppressHydrationWarning className={cn("h-full antialiased font-sans", inter.variable)}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LocaleProvider>
            <Providers>
              <TooltipProvider>
                {children}
                <Toaster position="top-right" />
                <PwaProvider />
                <AudioProvider />
              </TooltipProvider>
            </Providers>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
