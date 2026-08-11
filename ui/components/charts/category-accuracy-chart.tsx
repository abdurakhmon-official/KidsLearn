"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { useT } from "@/lib/i18n/provider";
import type { CategoryPerformance } from "@/types/api";
import { AXIS_STYLE, ChartTooltipCard, GRID_STYLE } from "./chart-primitives";

/**
 * Fanlar bo'yicha aniqlik. Bitta o'lchov — shuning uchun legend kerak emas
 * (sarlavha o'zi nomlaydi); har bir ustunda to'g'ridan-to'g'ri foiz yoziladi.
 *
 * Rang fanning o'zinikidan (`category.color`) olinadi, palitradan emas —
 * bu yerda rang identifikatsiya emas, fanning belgisi.
 */
export function CategoryAccuracyChart({ rows }: { rows: CategoryPerformance[] }) {
  const t = useT();

  const renderTooltip = ({ active, payload }: TooltipContentProps) => {
    if (!active || !payload?.length) return null;

    const row = payload[0].payload as CategoryPerformance;

    return (
      <ChartTooltipCard
        title={`${row.icon ?? ""} ${row.name}`.trim()}
        rows={[
          { name: t("progress.accuracy"), value: `${row.accuracy}%` },
          { name: t("game.correctCount", { correct: row.correct, total: row.total }), value: row.sessions },
        ]}
      />
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 44, bottom: 0, left: 8 }}>
        <CartesianGrid {...GRID_STYLE} horizontal={false} />
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis
          type="category"
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tick={AXIS_STYLE}
          width={110}
        />
        <Tooltip content={renderTooltip} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />

        <Bar dataKey="accuracy" radius={[0, 4, 4, 0]} barSize={18}>
          {rows.map((row) => (
            <Cell key={row.id} fill={row.color ?? "var(--chart-1)"} />
          ))}
          <LabelList
            dataKey="accuracy"
            position="right"
            offset={8}
            fontSize={12}
            fill="var(--muted-foreground)"
            formatter={(value) => `${value ?? 0}%`}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
