"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Users,
  Cake,
  CalendarDays,
  AlertTriangle,
  Clock,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import MetricCard from "@/components/MetricCard";
import DonutChart from "@/components/DonutChart";
import MonthlyAreaChart from "@/components/AreaChart";
import RecentTransactions from "@/components/RecentTransactions";
import DashboardHeader from "@/components/DashboardHeader";
import {
  ENTRY_CATEGORY_LABELS,
  EXPENSE_CATEGORY_LABELS,
} from "@/types/database";

interface DashboardData {
  metrics: {
    totalEntries: number;
    totalExpenses: number;
    netBalance: number;
    entriesByCategory: { category: string; total: number }[];
    expensesByCategory: { category: string; total: number }[];
  };
  monthlyData: { month: string; entradas: number; saidas: number }[];
  recentTransactions: {
    id: string;
    type: "entry" | "expense";
    date: string;
    category: string;
    amount: number;
    description?: string;
  }[];
  summary: {
    totalMembers: number;
    monthBirthdays: {
      id: string;
      name: string;
      photo_url?: string;
      phone?: string;
      birth_date?: string;
    }[];
    todayBirthdays: {
      id: string;
      name: string;
      photo_url?: string;
      phone?: string;
      birth_date?: string;
    }[];
    nextEvent: {
      id: string;
      title: string;
      event_date: string;
      event_time?: string;
      location?: string;
      event_type: string;
      banner_url?: string;
    } | null;
    expiringExpenses: {
      id: string;
      description: string;
      amount: number;
      due_day?: number;
      next_due_date?: string;
    }[];
  };
}

const ENTRY_COLORS: Record<string, string> = {
  dizimo: "#D4A843",
  oferta: "#059669",
  doacao: "#0EA5E9",
  campanha: "#8B5CF6",
  evento: "#F97316",
  outros_entradas: "#6B7280",
};

const EXPENSE_COLORS: Record<string, string> = {
  aluguel: "#F97316",
  energia: "#EAB308",
  agua: "#06B6D4",
  internet: "#8B5CF6",
  manutencao: "#8B5CF6",
  salarios: "#DC2626",
  missoes: "#06B6D4",
  eventos: "#F97316",
  material: "#6B7280",
  transporte: "#6B7280",
  seguro: "#6B7280",
  impostos: "#6B7280",
  outros_despesas: "#6B7280",
};

function formatEventDate(dateStr: string) {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function formatEventTime(timeStr?: string) {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":");
  return `${hours}h${minutes}`;
}

export default function DashboardClient({ data }: { data: DashboardData }) {
  const { metrics, monthlyData, recentTransactions, summary } = data;

  const expensesByCategory = metrics.expensesByCategory.map((item) => ({
    name:
      EXPENSE_CATEGORY_LABELS[
        item.category as keyof typeof EXPENSE_CATEGORY_LABELS
      ] || item.category,
    value: item.total,
    color: EXPENSE_COLORS[item.category] || "#6B7280",
  }));

  const entriesByCategory = metrics.entriesByCategory.map((item) => ({
    name:
      ENTRY_CATEGORY_LABELS[
        item.category as keyof typeof ENTRY_CATEGORY_LABELS
      ] || item.category,
    value: item.total,
    color: ENTRY_COLORS[item.category] || "#6B7280",
  }));

  return (
    <div>
      <DashboardHeader />

      {/* Cards de Resumo - Responsivo e Clicável */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {/* Total de Membros - Link para /dashboard/members */}
        <Link
          href="/dashboard/members"
          className="glass-card glass-card-hover p-3 md:p-4 opacity-0 animate-fade-in stagger-0 block"
        >
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-zinc-500 text-[10px] md:text-xs">Membros</p>
              <p className="text-zinc-100 text-lg md:text-xl font-semibold font-mono">
                {summary.totalMembers}
              </p>
            </div>
          </div>
        </Link>

        {/* Aniversariantes do Mês - Link para /dashboard/members */}
        <Link
          href="/dashboard/members"
          className="glass-card glass-card-hover p-3 md:p-4 opacity-0 animate-fade-in stagger-1 block"
        >
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Cake className="w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-400" />
            </div>
            <div>
              <p className="text-zinc-500 text-[10px] md:text-xs">
                Aniversariantes
              </p>
              <p className="text-zinc-100 text-lg md:text-xl font-semibold font-mono">
                {summary.monthBirthdays.length}
              </p>
            </div>
          </div>
          {summary.monthBirthdays.length > 0 && (
            <div className="flex -space-x-2">
              {summary.monthBirthdays.slice(0, 3).map((member) => (
                <div
                  key={member.id}
                  className="w-6 h-6 md:w-7 md:h-7 rounded-full border-2 border-surface overflow-hidden bg-zinc-800"
                  title={member.name}
                >
                  {member.photo_url ? (
                    <Image
                      src={member.photo_url}
                      alt={member.name}
                      width={28}
                      height={28}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400">
                      {member.name.charAt(0)}
                    </div>
                  )}
                </div>
              ))}
              {summary.monthBirthdays.length > 3 && (
                <div className="w-6 h-6 md:w-7 md:h-7 rounded-full border-2 border-surface bg-zinc-800 flex items-center justify-center">
                  <span className="text-[10px] text-zinc-400">
                    +{summary.monthBirthdays.length - 3}
                  </span>
                </div>
              )}
            </div>
          )}
        </Link>

        {/* Próximo Evento - Link para /dashboard/events */}
        <Link
          href="/dashboard/events"
          className="glass-card glass-card-hover p-3 md:p-4 opacity-0 animate-fade-in stagger-2 block"
        >
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <CalendarDays className="w-3.5 h-3.5 md:w-4 md:h-4 text-violet-400" />
            </div>
            <div className="min-w-0">
              <p className="text-zinc-500 text-[10px] md:text-xs">
                Próximo Evento
              </p>
              {summary.nextEvent ? (
                <>
                  <p className="text-zinc-100 text-sm font-semibold line-clamp-1">
                    {summary.nextEvent.title}
                  </p>
                  <p className="text-zinc-400 text-[10px] md:text-[11px] flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    <span className="truncate">
                      {formatEventDate(summary.nextEvent.event_date)}
                      {summary.nextEvent.event_time &&
                        ` às ${formatEventTime(summary.nextEvent.event_time)}`}
                    </span>
                  </p>
                </>
              ) : (
                <p className="text-zinc-500 text-sm">Nenhum evento</p>
              )}
            </div>
          </div>
        </Link>

        {/* Contas Vencendo - Link para /dashboard/fixed-expenses */}
        <Link
          href="/dashboard/fixed-expenses"
          className="glass-card glass-card-hover p-3 md:p-4 opacity-0 animate-fade-in stagger-3 block"
        >
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div
              className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center ${
                summary.expiringExpenses.length > 0
                  ? "bg-amber-500/10"
                  : "bg-zinc-800/50"
              }`}
            >
              <AlertTriangle
                className={`w-3.5 h-3.5 md:w-4 md:h-4 ${
                  summary.expiringExpenses.length > 0
                    ? "text-amber-400"
                    : "text-zinc-500"
                }`}
              />
            </div>
            <div>
              <p className="text-zinc-500 text-[10px] md:text-xs">Vencendo</p>
              <p
                className={`text-lg md:text-xl font-semibold font-mono ${
                  summary.expiringExpenses.length > 0
                    ? "text-amber-400"
                    : "text-zinc-100"
                }`}
              >
                {summary.expiringExpenses.length}
              </p>
            </div>
          </div>
          {summary.expiringExpenses.length > 0 && (
            <div className="space-y-1">
              {summary.expiringExpenses.slice(0, 2).map((expense) => (
                <p
                  key={expense.id}
                  className="text-zinc-500 text-[10px] md:text-[11px] line-clamp-1"
                >
                  {expense.description || "Sem descrição"}
                </p>
              ))}
            </div>
          )}
        </Link>
      </div>

      {/* Métricas Financeiras - Responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
        <MetricCard
          title="Entradas do Mês"
          value={metrics.totalEntries}
          icon={ArrowDownLeft}
          variant="gold"
          delay={400}
        />
        <MetricCard
          title="Despesas do Mês"
          value={metrics.totalExpenses}
          icon={ArrowUpRight}
          variant="ruby"
          delay={500}
        />
        <MetricCard
          title="Saldo Atual"
          value={metrics.netBalance}
          icon={Wallet}
          variant="emerald"
          delay={600}
        />
      </div>

      {/* Gráficos - Responsivo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="lg:col-span-2 opacity-0 animate-fade-in stagger-3">
          <MonthlyAreaChart data={monthlyData} height={250} />
        </div>
        <div className="opacity-0 animate-fade-in stagger-4">
          <DonutChart
            data={expensesByCategory}
            title="Despesas por Categoria"
            centerLabel="Total"
            centerValue={metrics.totalExpenses}
            height={220}
          />
        </div>
      </div>

      {/* Segunda linha de gráficos - Responsivo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="opacity-0 animate-fade-in stagger-5">
          <DonutChart
            data={entriesByCategory}
            title="Entradas por Categoria"
            centerLabel="Total"
            centerValue={metrics.totalEntries}
            height={220}
          />
        </div>
        <div className="lg:col-span-2 opacity-0 animate-fade-in stagger-6">
          <RecentTransactions transactions={recentTransactions} maxItems={5} />
        </div>
      </div>
    </div>
  );
}
