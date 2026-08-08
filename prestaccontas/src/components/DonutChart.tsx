"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
  title: string;
  centerLabel?: string;
  centerValue?: number;
  height?: number;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { color: string } }[];
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="glass-card px-4 py-3 border border-border-light">
      <p className="text-zinc-300 text-xs mb-1">{payload[0].name}</p>
      <p className="text-zinc-100 font-mono text-sm font-semibold">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

export default function DonutChart({
  data,
  title,
  centerLabel,
  centerValue,
  height = 300,
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="glass-card p-6">
      <h3 className="text-zinc-400 text-sm font-medium mb-4">{title}</h3>
      <div className="relative" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="85%"
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
              animationBegin={200}
              animationDuration={1000}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  className="transition-opacity duration-200 hover:opacity-80"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerLabel && (
            <span className="text-zinc-500 text-xs mb-1">{centerLabel}</span>
          )}
          {centerValue !== undefined && (
            <span className="text-zinc-100 font-mono text-lg font-semibold">
              {formatCurrency(centerValue)}
            </span>
          )}
          {!centerLabel && !centerValue && (
            <>
              <span className="text-zinc-500 text-xs mb-1">Total</span>
              <span className="text-zinc-100 font-mono text-lg font-semibold">
                {formatCurrency(total)}
              </span>
            </>
          )}
        </div>
      </div>
      {/* Legend */}
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-zinc-400 text-xs">{item.name}</span>
            </div>
            <span className="text-zinc-300 font-mono text-xs">
              {formatCurrency(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
