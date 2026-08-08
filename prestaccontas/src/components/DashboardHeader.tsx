"use client";

import { Calendar } from "lucide-react";

export default function DashboardHeader() {
  const now = new Date();
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  const currentMonth = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

  return (
    <div className="flex items-center justify-between mb-8 opacity-0 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
          Dashboard
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Visão geral financeira — {currentMonth}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-border text-zinc-400 text-sm">
          <Calendar className="w-4 h-4" />
          <span>{currentMonth}</span>
        </div>
      </div>
    </div>
  );
}
