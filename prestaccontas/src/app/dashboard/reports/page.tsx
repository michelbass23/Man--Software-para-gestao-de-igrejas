"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  Calendar,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Loader2,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ENTRY_CATEGORY_LABELS, EXPENSE_CATEGORY_LABELS } from "@/types/database";
import { getReportData } from "./actions";

interface ReportData {
  churchName: string;
  logoUrl: string | null;
  month: number;
  year: number;
  startDate: string;
  endDate: string;
  entries: {
    date: string;
    category: string;
    amount: number;
    description?: string;
    person_name?: string;
  }[];
  expenses: {
    date: string;
    category: string;
    amount: number;
    description?: string;
    person_name?: string;
  }[];
  entriesByCategory: { category: string; total: number; count: number }[];
  expensesByCategory: { category: string; total: number; count: number }[];
  totalEntries: number;
  totalExpenses: number;
  balance: number;
}

export default function ReportsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const months = [
    { value: 1, label: "Janeiro" },
    { value: 2, label: "Fevereiro" },
    { value: 3, label: "Março" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Maio" },
    { value: 6, label: "Junho" },
    { value: 7, label: "Julho" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Setembro" },
    { value: 10, label: "Outubro" },
    { value: 11, label: "Novembro" },
    { value: 12, label: "Dezembro" },
  ];

  const handleGenerate = async () => {
    setIsLoading(true);
    const data = await getReportData(month, year);
    setReportData(data);
    setIsLoading(false);
  };

  const handleDownloadPDF = async () => {
    if (!reportData) return;

    setIsGeneratingPDF(true);

    try {
      // Importação dinâmica do react-pdf
      const { pdf } = await import("@react-pdf/renderer");
      const PDFReport = (await import("@/components/PDFReport")).default;

      const blob = await pdf(<PDFReport data={reportData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `relatorio-financeiro-${reportData.month}-${reportData.year}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF. Tente novamente.");
    }

    setIsGeneratingPDF(false);
  };

  return (
    <div>
      {/* Header - Responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 opacity-0 animate-fade-in">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-zinc-100 tracking-tight flex items-center gap-2 md:gap-3">
            <FileText className="w-5 h-5 md:w-6 md:h-6 text-gold" />
            Relatórios
          </h1>
          <p className="text-zinc-500 text-xs md:text-sm mt-1">
            Gere relatórios financeiros mensais profissionais em PDF
          </p>
        </div>
      </div>

      {/* Filters - Responsivo */}
      <div className="glass-card p-4 md:p-6 mb-6 opacity-0 animate-fade-in stagger-1">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <label className="block text-zinc-400 text-sm mb-2">Mês</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-zinc-400 text-sm mb-2">Ano</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-black text-sm font-medium hover:bg-gold/90 transition-colors disabled:opacity-50 w-full sm:w-auto"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Calendar className="w-4 h-4" />
            )}
            Gerar Relatório
          </button>
        </div>
      </div>

      {/* Report Preview */}
      {reportData && (
        <div className="opacity-0 animate-fade-in stagger-2">
          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 mb-4">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-black text-sm font-medium hover:bg-gold/90 transition-colors disabled:opacity-50"
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isGeneratingPDF ? "Gerando PDF..." : "Baixar PDF Profissional"}
            </button>
          </div>

          {/* Report Content - Preview */}
          <div className="glass-card p-4 md:p-8" id="report-content">
            {/* Report Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8 border-b border-border pb-4 md:pb-6">
              <div className="flex items-center gap-3 md:gap-4">
                {reportData.logoUrl && (
                  <img
                    src={reportData.logoUrl}
                    alt="Logo"
                    className="w-12 h-12 md:w-16 md:h-16 rounded-xl object-cover"
                  />
                )}
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-zinc-100">
                    {reportData.churchName}
                  </h1>
                  <h2 className="text-base md:text-lg text-zinc-300">
                    Relatório Financeiro Mensal
                  </h2>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-zinc-200 font-semibold">
                  {months.find((m) => m.value === reportData.month)?.label} de{" "}
                  {reportData.year}
                </p>
                <p className="text-zinc-500 text-xs">
                  Gerado em {formatDate(new Date().toISOString())}
                </p>
              </div>
            </div>

            {/* Summary Cards - Responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
              <div className="p-3 md:p-4 rounded-xl bg-gold-dim border border-gold/20">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDownLeft className="w-4 h-4 text-gold" />
                  <span className="text-zinc-400 text-xs md:text-sm">
                    Total Entradas
                  </span>
                </div>
                <p className="text-lg md:text-xl font-bold font-mono text-gold">
                  {formatCurrency(reportData.totalEntries)}
                </p>
                <p className="text-zinc-500 text-[10px] md:text-xs mt-1">
                  {reportData.entries.length} registro(s)
                </p>
              </div>
              <div className="p-3 md:p-4 rounded-xl bg-ruby-dim border border-ruby/20">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpRight className="w-4 h-4 text-ruby" />
                  <span className="text-zinc-400 text-xs md:text-sm">
                    Total Despesas
                  </span>
                </div>
                <p className="text-lg md:text-xl font-bold font-mono text-ruby">
                  {formatCurrency(reportData.totalExpenses)}
                </p>
                <p className="text-zinc-500 text-[10px] md:text-xs mt-1">
                  {reportData.expenses.length} registro(s)
                </p>
              </div>
              <div className="p-3 md:p-4 rounded-xl bg-emerald-dim border border-emerald/20">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-emerald" />
                  <span className="text-zinc-400 text-xs md:text-sm">
                    Saldo
                  </span>
                </div>
                <p className="text-lg md:text-xl font-bold font-mono text-emerald">
                  {formatCurrency(reportData.balance)}
                </p>
                <p className="text-zinc-500 text-[10px] md:text-xs mt-1">
                  {reportData.balance >= 0 ? "Positivo" : "Negativo"}
                </p>
              </div>
            </div>

            {/* Entradas por Categoria */}
            {reportData.entriesByCategory.length > 0 && (
              <div className="mb-6 md:mb-8">
                <h3 className="text-base md:text-lg font-semibold text-zinc-100 mb-3 md:mb-4 flex items-center gap-2">
                  <ArrowDownLeft className="w-4 h-4 md:w-5 md:h-5 text-gold" />
                  Entradas por Categoria
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
                  {reportData.entriesByCategory.map((cat) => (
                    <div
                      key={cat.category}
                      className="p-2 md:p-3 rounded-lg bg-zinc-900/50 border border-border"
                    >
                      <p className="text-zinc-500 text-[10px] md:text-xs">
                        {ENTRY_CATEGORY_LABELS[
                          cat.category as keyof typeof ENTRY_CATEGORY_LABELS
                        ] || cat.category}
                      </p>
                      <p className="text-gold font-mono text-sm md:text-base font-semibold">
                        {formatCurrency(cat.total)}
                      </p>
                      <p className="text-zinc-600 text-[10px]">
                        {cat.count} registro(s)
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Despesas por Categoria */}
            {reportData.expensesByCategory.length > 0 && (
              <div className="mb-6 md:mb-8">
                <h3 className="text-base md:text-lg font-semibold text-zinc-100 mb-3 md:mb-4 flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 text-ruby" />
                  Despesas por Categoria
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
                  {reportData.expensesByCategory.map((cat) => (
                    <div
                      key={cat.category}
                      className="p-2 md:p-3 rounded-lg bg-zinc-900/50 border border-border"
                    >
                      <p className="text-zinc-500 text-[10px] md:text-xs">
                        {EXPENSE_CATEGORY_LABELS[
                          cat.category as keyof typeof EXPENSE_CATEGORY_LABELS
                        ] || cat.category}
                      </p>
                      <p className="text-ruby font-mono text-sm md:text-base font-semibold">
                        {formatCurrency(cat.total)}
                      </p>
                      <p className="text-zinc-600 text-[10px]">
                        {cat.count} registro(s)
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-border pt-4 md:pt-6 text-center">
              <p className="text-zinc-500 text-xs md:text-sm">
                Clique em &quot;Baixar PDF Profissional&quot; para obter o
                relatório completo com todas as transações detalhadas
              </p>
              <p className="text-zinc-600 text-[10px] md:text-xs mt-1">
                PrestaContas - Sistema de Prestação de Contas para Igrejas
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
