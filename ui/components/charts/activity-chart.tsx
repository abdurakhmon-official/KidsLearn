"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { useLocale, useT } from "@/lib/i18n/provider";
import { axisTickInterval, formatAxisDate } from "@/lib/format";
import type { ChartDay } from "@/types/api";
import {
  AXIS_STYLE,
  CHART_COLORS,
  ChartLegend,
  ChartTooltipCard,
  GRID_STYLE,
} from "./chart-primitives";

type Measure = { key: keyof ChartDay & string; label: string; color: string };

export function ActivityChart({ days }: { days: ChartDay[] }) {
  const t = useT();
  const { locale } = useLocale();

  const measures: Measure[] = [
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
        <AreaChart data={days} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
          <defs>
            {measures.map((measure) => (
              <linearGradient key={measure.key} id={`fill-${measure.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={measure.color} stopOpacity={0.28} />
                <stop offset="100%" stopColor={measure.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid {...GRID_STYLE} vertical={false} />

          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={AXIS_STYLE}
            interval={axisTickInterval(days.length)}
            tickFormatter={(value: string) => formatAxisDate(value, locale)}
            minTickGap={8}
          />
          <YAxis tickLine={false} axisLine={false} tick={AXIS_STYLE} width={44} allowDecimals={false} />

          <Tooltip content={renderTooltip} cursor={{ stroke: "var(--border)", strokeWidth: 1 }} />

          {measures.map((measure) => (
            <Area
              key={measure.key}
              type="monotone"
              dataKey={measure.key}
              name={measure.label}
              stroke={measure.color}
              strokeWidth={2}
              fill={`url(#fill-${measure.key})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
}
