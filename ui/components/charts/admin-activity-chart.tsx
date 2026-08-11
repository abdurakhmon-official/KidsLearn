"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { useLocale, useT } from "@/lib/i18n/provider";
import { axisTickInterval, formatAxisDate } from "@/lib/format";
import type { AdminChartDay } from "@/types/api";
import { AXIS_STYLE, CHART_COLORS, ChartLegend, ChartTooltipCard, GRID_STYLE } from "./chart-primitives";

/** 14 kunlik umumiy faollik. Ustunlar orasida 2px bo'shliq — CVD uchun ham foydali. */
export function AdminActivityChart({ days }: { days: AdminChartDay[] }) {
  const t = useT();
  const { locale } = useLocale();

  const measures = [
    { key: "points", label: t("progress.points"), color: CHART_COLORS.points },
    { key: "lessonsCompleted", label: t("dashboard.todayLessons"), color: CHART_COLORS.lessons },
    { key: "gamesPlayed", label: t("dashboard.todayGames"), color: CHART_COLORS.games },
  ];

  const renderTooltip = ({ active, payload, label }: TooltipContentProps) => {
    if (!active || !payload?.length) return null;

    return (
      <ChartTooltipCard
        title={formatAxisDate(String(label), locale)}
        rows={payload.map((entry) => ({
          name: String(entry.name),
          value: Number(entry.value ?? 0),
          color: entry.color,
        }))}
      />
    );
  };

  return (
    <>
      <ChartLegend items={measures.map(({ label, color }) => ({ label, color }))} className="mb-2" />

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={days} margin={{ top: 4, right: 8, bottom: 0, left: -20 }} barGap={2}>
          <CartesianGrid {...GRID_STYLE} vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={AXIS_STYLE}
            interval={axisTickInterval(days.length)}
            tickFormatter={(value: string) => formatAxisDate(value, locale)}
          />
          <YAxis tickLine={false} axisLine={false} tick={AXIS_STYLE} width={44} allowDecimals={false} />
          <Tooltip content={renderTooltip} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />

          {measures.map((measure) => (
            <Bar
              key={measure.key}
              dataKey={measure.key}
              name={measure.label}
              fill={measure.color}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}
