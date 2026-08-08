"use client";

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface AreaChartProps {
  data: { month: string; entradas: number; saidas: number }[];
  height?: number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="glass-card px-4 py-3 border border-border-light">
      <p className="text-zinc-500 text-xs mb-2 capitalize">{label}</p>
      {payload.map((item, index) => (
        <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-zinc-400 text-xs">{item.name}:</span>
          <span className="text-zinc-100 font-mono text-xs font-medium">
            {formatCurrency(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function MonthlyAreaChart({ data, height = 300 }: AreaChartProps) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-zinc-400 text-sm font-medium mb-4">
        Fluxo Financeiro Mensal
      </h3>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsAreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="gradientEntries" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D4A843" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#D4A843" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradientExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#DC2626" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#DC2626" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717A", fontSize: 11 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717A", fontSize: 11 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="entradas"
              name="Entradas"
              stroke="#D4A843"
              strokeWidth={2}
              fill="url(#gradientEntries)"
              animationDuration={1500}
              animationEasing="ease-out"
            />
            <Area
              type="monotone"
              dataKey="saidas"
              name="Saídas"
              stroke="#DC2626"
              strokeWidth={2}
              fill="url(#gradientExpenses)"
              animationDuration={1500}
              animationEasing="ease-out"
              animationBegin={300}
            />
          </RechartsAreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
