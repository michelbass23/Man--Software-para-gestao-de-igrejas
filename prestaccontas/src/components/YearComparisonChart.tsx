"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn, formatCurrency } from "@/lib/utils";

interface YearComparisonChartProps {
  data: { month: string; entradasAtual: number; entradasAnterior: number }[];
  currentYear: number;
  previousYear: number;
  totalCurrent: number;
  totalPrevious: number;
  trend: number;
  height?: number;
}

function CustomTooltip({
  active,
  payload,
  label,
  currentYear,
  previousYear,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
  currentYear: number;
  previousYear: number;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="glass-card px-4 py-3 border border-border-light">
      <p className="text-subtle text-xs mb-2 capitalize">{label}</p>
      {payload.map((item, index) => (
        <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-muted text-xs">
            {item.name === "entradasAtual" ? currentYear : previousYear}:
          </span>
          <span className="text-strong font-mono text-xs font-medium">
            {formatCurrency(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function YearComparisonChart({
  data,
  currentYear,
  previousYear,
  totalCurrent,
  totalPrevious,
  trend,
  height = 260,
}: YearComparisonChartProps) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-muted text-sm font-medium">
            Entradas: {currentYear} vs {previousYear}
          </h3>
          <p className="text-strong text-lg font-semibold font-mono mt-1">
            {formatCurrency(totalCurrent)}
          </p>
          <p className="text-faint text-[11px] mt-0.5">
            {previousYear}: {formatCurrency(totalPrevious)}
          </p>
        </div>
        <span
          className={cn(
            "text-xs font-mono px-2 py-1 rounded-full h-fit",
            trend >= 0 ? "bg-emerald-dim text-emerald" : "bg-ruby-dim text-ruby"
          )}
        >
          {trend >= 0 ? "+" : ""}
          {trend}% vs {previousYear}
        </span>
      </div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border-light)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-subtle)", fontSize: 11 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-subtle)", fontSize: 11 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              dx={-10}
            />
            <Tooltip
              content={
                <CustomTooltip currentYear={currentYear} previousYear={previousYear} />
              }
            />
            <Bar
              dataKey="entradasAnterior"
              name="entradasAnterior"
              fill="rgba(212,168,67,0.25)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="entradasAtual"
              name="entradasAtual"
              fill="#D4A843"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
