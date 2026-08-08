"use client";

import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  ENTRY_CATEGORY_LABELS,
  EXPENSE_CATEGORY_LABELS,
  type EntryCategory,
  type ExpenseCategory,
} from "@/types/database";

interface Transaction {
  id: string;
  type: "entry" | "expense";
  date: string;
  category: string;
  amount: number;
  description?: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  maxItems?: number;
}

export default function RecentTransactions({
  transactions,
  maxItems = 8,
}: RecentTransactionsProps) {
  const displayTransactions = transactions.slice(0, maxItems);

  return (
    <div className="glass-card p-6">
      <h3 className="text-zinc-400 text-sm font-medium mb-4">
        Últimos Lançamentos
      </h3>
      <div className="space-y-1">
        {displayTransactions.map((tx, index) => {
          const isEntry = tx.type === "entry";
          const categoryLabel = isEntry
            ? ENTRY_CATEGORY_LABELS[tx.category as EntryCategory] || tx.category
            : EXPENSE_CATEGORY_LABELS[tx.category as ExpenseCategory] ||
              tx.category;

          return (
            <div
              key={tx.id}
              className="flex items-center gap-4 py-3 px-3 rounded-xl hover:bg-white/[0.02] transition-colors opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                  isEntry ? "bg-gold-dim" : "bg-ruby-dim"
                )}
              >
                {isEntry ? (
                  <ArrowDownLeft className="w-4 h-4 text-gold" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-ruby" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-200 truncate">
                  {tx.description || categoryLabel}
                </p>
                <p className="text-xs text-zinc-500">
                  {categoryLabel} · {formatDate(tx.date)}
                </p>
              </div>
              <span
                className={cn(
                  "font-mono text-sm font-medium shrink-0",
                  isEntry ? "text-gold" : "text-ruby"
                )}
              >
                {isEntry ? "+" : "-"} {formatCurrency(tx.amount)}
              </span>
            </div>
          );
        })}

        {displayTransactions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-zinc-500 text-sm">Nenhum lançamento encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
