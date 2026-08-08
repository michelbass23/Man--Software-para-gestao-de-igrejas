"use client";

import { LucideIcon } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant: "gold" | "ruby" | "emerald" | "default";
  prefix?: string;
  suffix?: string;
  isCurrency?: boolean;
  trend?: { value: number; label: string };
  className?: string;
  delay?: number;
}

const variantStyles = {
  gold: {
    iconBg: "bg-gold-dim",
    iconColor: "text-gold",
    glow: "shadow-[0_0_40px_rgba(212,168,67,0.08)]",
    accent: "text-gold",
  },
  ruby: {
    iconBg: "bg-ruby-dim",
    iconColor: "text-ruby",
    glow: "shadow-[0_0_40px_rgba(220,38,38,0.08)]",
    accent: "text-ruby",
  },
  emerald: {
    iconBg: "bg-emerald-dim",
    iconColor: "text-emerald",
    glow: "shadow-[0_0_40px_rgba(5,150,105,0.08)]",
    accent: "text-emerald",
  },
  default: {
    iconBg: "bg-zinc-800/50",
    iconColor: "text-zinc-400",
    glow: "",
    accent: "text-zinc-100",
  },
};

export default function MetricCard({
  title,
  value,
  icon: Icon,
  variant,
  isCurrency = true,
  trend,
  className,
  delay = 0,
}: MetricCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "glass-card glass-card-hover p-6 opacity-0 animate-fade-in",
        styles.glow,
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            styles.iconBg
          )}
        >
          <Icon className={cn("w-5 h-5", styles.iconColor)} />
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-mono px-2 py-1 rounded-full",
              trend.value >= 0
                ? "bg-emerald-dim text-emerald"
                : "bg-ruby-dim text-ruby"
            )}
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}%
          </span>
        )}
      </div>
      <p className="text-zinc-400 text-sm font-medium mb-1">{title}</p>
      <p className={cn("text-2xl font-semibold font-mono tracking-tight", styles.accent)}>
        {isCurrency ? formatCurrency(value) : value}
      </p>
      {trend && (
        <p className="text-zinc-500 text-xs mt-2">{trend.label}</p>
      )}
    </div>
  );
}
