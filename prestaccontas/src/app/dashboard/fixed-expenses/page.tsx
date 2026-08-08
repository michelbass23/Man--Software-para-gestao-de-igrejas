"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  CalendarClock,
  Pencil,
  Trash2,
  Check,
  AlertTriangle,
  Clock,
  FileText,
} from "lucide-react";
import EntryModal from "@/components/EntryModal";
import ReceiptViewer from "@/components/ReceiptViewer";
import ReceiptThumbnail from "@/components/ReceiptThumbnail";
import { formatCurrency, formatDate } from "@/lib/utils";
import { EXPENSE_CATEGORY_LABELS, type ExpenseCategory } from "@/types/database";
import {
  getFixedExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  markExpenseAsPaid,
  getCurrentTenantId,
} from "../expenses/actions";
import { generateAlerts } from "../alerts/actions";

interface FixedExpense {
  id: string;
  date: string;
  category: string;
  amount: number;
  description?: string;
  person_name?: string;
  receipt_url?: string;
  is_fixed: boolean;
  due_day?: number;
  next_due_date?: string;
  status: string;
}

function calculateNextDueDate(dueDay: number): string {
  const now = new Date();
  const currentDay = now.getDate();
  let month = now.getMonth();
  let year = now.getFullYear();

  // Se o dia de vencimento já passou este mês, vai para o próximo mês
  if (dueDay < currentDay) {
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  }

  // Criar data com o dia de vencimento
  const dueDate = new Date(year, month, dueDay);
  
  // Formatar como YYYY-MM-DD
  const y = dueDate.getFullYear();
  const m = String(dueDate.getMonth() + 1).padStart(2, "0");
  const d = String(dueDate.getDate()).padStart(2, "0");
  
  return `${y}-${m}-${d}`;
}

export default function FixedExpensesPage() {
  const [expenses, setExpenses] = useState<FixedExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<FixedExpense | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentTenantId().then(setTenantId).catch(console.error);
  }, []);

  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    const data = await getFixedExpenses();
    setExpenses(data);
    setIsLoading(false);
    // Gerar alertas ao carregar
    await generateAlerts();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const filteredExpenses = expenses.filter((e) =>
    !searchQuery ||
    e.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.person_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleEdit = (expense: FixedExpense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta despesa fixa?")) return;
    const result = await deleteExpense(id);
    if (!result.error) {
      fetchExpenses();
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    const result = await markExpenseAsPaid(id);
    if (!result.error) {
      fetchExpenses();
    }
  };

  const handleSubmit = async (data: {
    date: string;
    category: string;
    amount: number;
    description: string;
    personName: string;
    receiptUrl?: string;
  }) => {
    setIsSaving(true);
    let result;

    // Usar o dia da data selecionada como dia de vencimento
    const dueDay = new Date(data.date + "T12:00:00").getDate();
    
    // Calcular próximo vencimento baseado no dia de vencimento
    const nextDueDate = calculateNextDueDate(dueDay);

    const submitData = {
      ...data,
      isFixed: true,
      dueDay,
      nextDueDate,
    };

    if (editingExpense) {
      result = await updateExpense(editingExpense.id, submitData);
    } else {
      result = await createExpense(submitData);
    }

    if (!result.error) {
      setIsModalOpen(false);
      setEditingExpense(null);
      fetchExpenses();
    }
    setIsSaving(false);
  };

  const getStatusBadge = (expense: FixedExpense) => {
    if (!expense.next_due_date) return null;

    // Usar data local sem timezone
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    
    const diffDays = Math.round(
      (new Date(expense.next_due_date + "T12:00:00").getTime() - 
       new Date(todayStr + "T12:00:00").getTime()) / (1000 * 60 * 60 * 24)
    );

    if (expense.status === "paid") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-dim text-emerald text-xs font-medium">
          <Check className="w-3 h-3" /> Pago
        </span>
      );
    }

    if (diffDays < 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-ruby-dim text-ruby text-xs font-medium">
          <AlertTriangle className="w-3 h-3" /> Vencida há {Math.abs(diffDays)} dia{Math.abs(diffDays) > 1 ? "s" : ""}
        </span>
      );
    }

    if (diffDays === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-ruby-dim text-ruby text-xs font-medium">
          <AlertTriangle className="w-3 h-3" /> Vence hoje!
        </span>
      );
    }

    if (diffDays <= 7) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gold-dim text-gold text-xs font-medium">
          <Clock className="w-3 h-3" /> Vence em {diffDays} dia{diffDays !== 1 ? "s" : ""}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-800/50 text-zinc-400 text-xs font-medium">
        <CalendarClock className="w-3 h-3" /> {formatDate(expense.next_due_date)}
      </span>
    );
  };

  return (
    <div>
      {/* Header - Responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 opacity-0 animate-fade-in">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-zinc-100 tracking-tight flex items-center gap-2 md:gap-3">
            <CalendarClock className="w-5 h-5 md:w-6 md:h-6 text-gold" />
            Despesas Fixas
          </h1>
          <p className="text-zinc-500 text-xs md:text-sm mt-1">
            Contas recorrentes com alertas de vencimento
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-black text-sm font-medium hover:bg-gold/90 transition-colors w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Nova Despesa Fixa
        </button>
      </div>

      {/* Search - Responsivo */}
      <div className="flex gap-3 mb-6 opacity-0 animate-fade-in stagger-1">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar despesas fixas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>

      {/* Cards - Responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 opacity-0 animate-fade-in stagger-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="h-5 bg-zinc-800 rounded-full w-20" />
                <div className="h-4 bg-zinc-800 rounded w-16" />
              </div>
              <div className="h-5 bg-zinc-800 rounded w-3/4 mb-2" />
              <div className="h-7 bg-zinc-800 rounded w-1/2 mb-3" />
              <div className="h-4 bg-zinc-800 rounded w-full" />
            </div>
          ))
        ) : filteredExpenses.length === 0 ? (
          <div className="col-span-full glass-card rounded-xl p-8 md:p-12 text-center">
            <CalendarClock className="w-10 h-10 md:w-12 md:h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm">
              Nenhuma despesa fixa cadastrada
            </p>
            <p className="text-zinc-500 text-xs mt-1">
              Cadastre contas como água, luz, aluguel para receber alertas
            </p>
          </div>
        ) : (
          filteredExpenses.map((expense, index) => (
            <div
              key={expense.id}
              className="glass-card rounded-xl p-4 group hover:border-amber-500/30 transition-colors opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-ruby-dim text-ruby text-[10px] md:text-xs font-medium">
                  {EXPENSE_CATEGORY_LABELS[expense.category as ExpenseCategory] || expense.category}
                </span>
                {getStatusBadge(expense)}
              </div>

              {/* Descrição e Valor */}
              <h3 className="text-zinc-100 font-medium text-sm mb-1 line-clamp-1">
                {expense.description || "Sem descrição"}
              </h3>
              <p className="text-ruby font-mono text-xl font-semibold mb-3">
                {formatCurrency(Number(expense.amount))}
              </p>

              {/* Info */}
              <div className="space-y-1.5 mb-3">
                <div className="flex items-center justify-between">
                  <p className="text-zinc-500 text-xs">Vencimento</p>
                  <p className="text-zinc-300 text-xs font-medium">
                    Dia {expense.due_day || "—"}
                  </p>
                </div>
                {expense.person_name && (
                  <p className="text-zinc-500 text-xs">
                    Responsável: {expense.person_name}
                  </p>
                )}
              </div>

              {/* Comprovante */}
              {expense.receipt_url && (
                <div className="mb-3">
                  <ReceiptViewer url={expense.receipt_url}>
                    <div className="cursor-pointer group/receipt">
                      <ReceiptThumbnail url={expense.receipt_url} className="group-hover/receipt:ring-2 group-hover/receipt:ring-amber-500/50 transition-all rounded-lg" />
                    </div>
                  </ReceiptViewer>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1 pt-2 border-t border-border">
                <button
                  onClick={() => handleMarkAsPaid(expense.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg text-zinc-500 hover:text-emerald hover:bg-emerald-dim transition-colors"
                  title="Marcar como pago"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span className="text-xs">Pago</span>
                </button>
                <button
                  onClick={() => handleEdit(expense)}
                  className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                  title="Editar"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span className="text-xs">Editar</span>
                </button>
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg text-zinc-500 hover:text-ruby hover:bg-ruby-dim transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="text-xs">Excluir</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <EntryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExpense(null);
        }}
        type="expense"
        onSubmit={handleSubmit}
        isLoading={isSaving}
        initialData={editingExpense}
        tenantId={tenantId || undefined}
      />
    </div>
  );
}
