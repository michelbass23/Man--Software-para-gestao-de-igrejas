"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, ArrowDownLeft, Filter, Pencil, Trash2, Receipt } from "lucide-react";
import EntryModal from "@/components/EntryModal";
import ReceiptViewer from "@/components/ReceiptViewer";
import ReceiptThumbnail from "@/components/ReceiptThumbnail";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ENTRY_CATEGORY_LABELS, type EntryCategory } from "@/types/database";
import { getEntries, createEntry, updateEntry, deleteEntry, getCurrentTenantId } from "./actions";

interface Entry {
  id: string;
  date: string;
  category: string;
  amount: number;
  description?: string;
  person_name?: string;
  receipt_url?: string;
}

export default function EntriesPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    getCurrentTenantId().then(setTenantId).catch(console.error);
  }, []);

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    const result = await getEntries({
      search: searchQuery || undefined,
      category: categoryFilter || undefined,
      page,
      limit: ITEMS_PER_PAGE,
    });
    setEntries(result.entries);
    setTotal(result.total);
    setIsLoading(false);
  }, [searchQuery, categoryFilter, page]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const totalAmount = entries.reduce((sum, e) => sum + Number(e.amount), 0);

  const handleCreate = () => {
    setEditingEntry(null);
    setSaveError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (entry: Entry) => {
    setEditingEntry(entry);
    setSaveError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este lançamento?")) return;
    const result = await deleteEntry(id);
    if (!result.error) {
      fetchEntries();
    } else {
      alert(result.error);
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
    setSaveError(null);

    let result;

    if (editingEntry) {
      result = await updateEntry(editingEntry.id, data);
    } else {
      result = await createEntry(data);
    }

    if (result.error) {
      setSaveError(result.error);
      setIsSaving(false);
      return;
    }

    setIsModalOpen(false);
    setEditingEntry(null);
    setIsSaving(false);
    fetchEntries();
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      dizimo: "bg-yellow-500/10 text-yellow-400",
      oferta: "bg-emerald-500/10 text-emerald-400",
      doacao: "bg-blue-500/10 text-blue-400",
      campanha: "bg-violet-500/10 text-violet-400",
      evento: "bg-orange-500/10 text-orange-400",
      outros_entradas: "bg-zinc-500/10 text-zinc-400",
    };
    return colors[category] || colors.outros_entradas;
  };

  return (
    <div>
      {/* Header - Responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 opacity-0 animate-fade-in">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-zinc-100 tracking-tight flex items-center gap-2 md:gap-3">
            <ArrowDownLeft className="w-5 h-5 md:w-6 md:h-6 text-gold" />
            Entradas
          </h1>
          <p className="text-zinc-500 text-xs md:text-sm mt-1">
            Dízimos, ofertas e doações
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-black text-sm font-medium hover:bg-gold/90 transition-colors w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Nova Entrada
        </button>
      </div>

      {/* Error toast */}
      {saveError && (
        <div className="mb-4 p-3 rounded-xl bg-ruby-dim border border-ruby/20">
          <p className="text-ruby text-sm">{saveError}</p>
        </div>
      )}

      {/* Summary - Responsivo */}
      <div className="glass-card p-3 md:p-4 mb-6 opacity-0 animate-fade-in stagger-1">
        <div className="flex items-center gap-4 md:gap-6">
          <div>
            <p className="text-zinc-500 text-[10px] md:text-xs">Total de Registros</p>
            <p className="text-zinc-200 font-mono text-base md:text-lg font-semibold">
              {total}
            </p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div>
            <p className="text-zinc-500 text-[10px] md:text-xs">Valor Total</p>
            <p className="text-gold font-mono text-base md:text-lg font-semibold">
              {formatCurrency(totalAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Filters - Responsivo */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 opacity-0 animate-fade-in stagger-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por nome ou descrição..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="pl-10 w-full"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="pl-10 pr-8 w-full sm:w-auto sm:min-w-[180px]"
          >
            <option value="">Todas categorias</option>
            {Object.entries(ENTRY_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Entries Grid - Cards */}
      <div className="opacity-0 animate-fade-in stagger-3">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="glass-card rounded-xl p-4 animate-pulse"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="h-4 bg-zinc-800 rounded w-1/3" />
                  <div className="h-6 bg-zinc-800 rounded-full w-20" />
                </div>
                <div className="h-6 bg-zinc-800 rounded w-1/2 mb-2" />
                <div className="h-3 bg-zinc-800 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="glass-card rounded-xl p-8 md:p-12 text-center">
            <ArrowDownLeft className="w-10 h-10 md:w-12 md:h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400 text-sm">
              {searchQuery || categoryFilter
                ? "Nenhuma entrada encontrada com os filtros selecionados"
                : "Nenhuma entrada registrada"}
            </p>
            {!searchQuery && !categoryFilter && (
              <button
                onClick={handleCreate}
                className="mt-4 text-gold text-sm hover:text-gold/80 transition-colors"
              >
                Registrar primeira entrada
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="glass-card rounded-xl p-4 group hover:border-gold/30 transition-colors"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400 text-xs font-mono">
                        {formatDate(entry.date)}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${getCategoryColor(
                        entry.category
                      )}`}
                    >
                      {ENTRY_CATEGORY_LABELS[entry.category as EntryCategory] || entry.category}
                    </span>
                  </div>

                  {/* Valor */}
                  <p className="text-gold font-mono text-xl font-semibold mb-2">
                    + {formatCurrency(Number(entry.amount))}
                  </p>

                  {/* Info */}
                  <div className="space-y-1.5 mb-3">
                    {entry.person_name && (
                      <p className="text-zinc-300 text-sm">
                        {entry.person_name}
                      </p>
                    )}
                    {entry.description && (
                      <p className="text-zinc-500 text-xs line-clamp-2">
                        {entry.description}
                      </p>
                    )}
                  </div>

                  {/* Comprovante */}
                  {entry.receipt_url && (
                    <div className="mb-3">
                      <ReceiptViewer url={entry.receipt_url}>
                        <div className="cursor-pointer group/receipt">
                          <ReceiptThumbnail url={entry.receipt_url} className="group-hover/receipt:ring-2 group-hover/receipt:ring-gold/50 transition-all rounded-lg" />
                        </div>
                      </ReceiptViewer>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1 pt-2 border-t border-border">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg text-zinc-500 hover:text-gold hover:bg-gold-dim transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span className="text-xs">Editar</span>
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg text-zinc-500 hover:text-ruby hover:bg-ruby-dim transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="text-xs">Excluir</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="text-zinc-500 text-sm">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <EntryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEntry(null);
          setSaveError(null);
        }}
        type="entry"
        onSubmit={handleSubmit}
        isLoading={isSaving}
        initialData={editingEntry}
        tenantId={tenantId || undefined}
      />
    </div>
  );
}
