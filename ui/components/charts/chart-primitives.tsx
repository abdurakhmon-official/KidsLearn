"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Grafik o'lchamlari — har bir o'lchov butun ilova bo'ylab bitta rangda
 * qoladi. Rang o'lchovga biriktirilgan, seriyalar soniga emas: filtr
 * seriyani olib tashlasa, qolganlari qayta bo'yalmaydi.
 */
export const CHART_COLORS = {
  points: "var(--chart-1)",
  lessons: "var(--chart-2)",
  games: "var(--chart-3)",
  minutes: "var(--chart-4)",
  stars: "var(--chart-5)",
} as const;

export type ChartMeasure = keyof typeof CHART_COLORS;

export const AXIS_STYLE = {
  fill: "var(--muted-foreground)",
  fontSize: 12,
} as const;

export const GRID_STYLE = {
  stroke: "var(--border)",
  strokeDasharray: "3 3",
} as const;

/**
 * Legend har doim ko'rsatiladi (2+ seriya uchun) — dark rejimda qo'shni
 * ranglarning CVD ajralishi 6–8 oralig'ida, ya'ni rang yagona signal
 * bo'lib qololmaydi.
 */
export function ChartLegend({
  items,
  className,
}: {
  items: { label: string; color: string }[];
  className?: string;
}) {
  if (items.length < 2) return null;

  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1", className)}>
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            aria-hidden
            className="size-2.5 shrink-0 rounded-[3px]"
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

type TooltipRow = { name: string; value: number | string; color?: string };

/** shadcn `Card` uslubidagi tooltip — recharts'ning standarti tema bilmaydi. */
export function ChartTooltipCard({ title, rows }: { title: ReactNode; rows: TooltipRow[] }) {
  return (
    <div className="rounded-lg bg-popover px-3 py-2 text-xs shadow-md ring-1 ring-border">
      <p className="mb-1.5 font-medium text-popover-foreground">{title}</p>
      <ul className="space-y-0.5">
        {rows.map((row) => (
          <li key={row.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              {row.color && (
                <span aria-hidden className="size-2 rounded-[2px]" style={{ backgroundColor: row.color }} />
              )}
              {row.name}
            </span>
            <span className="font-medium tabular-nums text-popover-foreground">{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Grafik idishi: sarlavha, legend va aniq balandlik. */
export function ChartFrame({
  title,
  action,
  legend,
  height = "h-72",
  children,
  className,
}: {
  title?: ReactNode;
  action?: ReactNode;
  legend?: ReactNode;
  height?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          {title && <h3 className="font-heading text-base font-medium">{title}</h3>}
          {action}
        </div>
      )}
      {legend}
      {/* ResponsiveContainer ota konteynerdan balandlik oladi. */}
      <div className={height}>{children}</div>
    </div>
  );
}
