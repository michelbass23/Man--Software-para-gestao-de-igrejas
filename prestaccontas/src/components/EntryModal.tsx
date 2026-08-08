"use client";

import { useState, useEffect, useRef } from "react";
import { X, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ENTRY_CATEGORIES,
  EXPENSE_CATEGORIES,
  ENTRY_CATEGORY_LABELS,
  EXPENSE_CATEGORY_LABELS,
} from "@/types/database";

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "entry" | "expense";
  onSubmit: (data: {
    date: string;
    category: string;
    amount: number;
    description: string;
    personName: string;
    receiptUrl?: string;
  }) => void;
  isLoading?: boolean;
  initialData?: {
    date: string;
    category: string;
    amount: number;
    description?: string;
    person_name?: string;
    receipt_url?: string;
  } | null;
  tenantId?: string;
}

function formatCurrencyInput(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (!numbers) return "";
  const cents = parseInt(numbers, 10);
  const reais = cents / 100;
  return reais.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseCurrencyValue(formatted: string): number {
  const numbers = formatted.replace(/\D/g, "");
  if (!numbers) return 0;
  return parseInt(numbers, 10) / 100;
}

function amountToDisplay(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function EntryModal({
  isOpen,
  onClose,
  type,
  onSubmit,
  isLoading,
  initialData,
  tenantId,
}: EntryModalProps) {
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [amountDisplay, setAmountDisplay] = useState("");
  const [personName, setPersonName] = useState("");
  const [description, setDescription] = useState("");
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEntry = type === "entry";
  const isEditing = !!initialData;
  const categories = isEntry ? ENTRY_CATEGORIES : EXPENSE_CATEGORIES;
  const categoryLabels = isEntry
    ? ENTRY_CATEGORY_LABELS
    : EXPENSE_CATEGORY_LABELS;

  // Reset form when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      setError("");
      setUploadError(null);
      if (initialData) {
        setDate(initialData.date || new Date().toISOString().split("T")[0]);
        setCategory(initialData.category || "");
        setAmountDisplay(initialData.amount ? amountToDisplay(initialData.amount) : "");
        setPersonName(initialData.person_name || "");
        setDescription(initialData.description || "");
        setReceiptUrl(initialData.receipt_url || undefined);
        setReceiptPreview(initialData.receipt_url || null);
      } else {
        setDate(new Date().toISOString().split("T")[0]);
        setCategory("");
        setAmountDisplay("");
        setPersonName("");
        setDescription("");
        setReceiptUrl(undefined);
        setReceiptPreview(null);
      }
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatCurrencyInput(raw);
    setAmountDisplay(formatted);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tenantId) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Tipo de arquivo não permitido. Use: JPG, PNG, WEBP, GIF ou PDF");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Arquivo muito grande. Tamanho máximo: 5MB");
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tenantId", tenantId);

      const response = await fetch("/api/upload-receipt", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao fazer upload");
      }

      console.log("Upload concluído, URL:", data.url);

      // Atualizar preview e URL
      setReceiptPreview(data.url);
      setReceiptUrl(data.url);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao fazer upload do arquivo";
      setUploadError(errorMessage);
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveReceipt = () => {
    setReceiptUrl(undefined);
    setReceiptPreview(null);
    setUploadError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const amount = parseCurrencyValue(amountDisplay);

    if (!date) {
      setError("Selecione uma data");
      return;
    }
    if (!category) {
      setError("Selecione uma categoria");
      return;
    }
    if (amount <= 0) {
      setError("Digite um valor válido");
      return;
    }

    // Garantir que receiptUrl está correto no momento do submit
    console.log("Submit - receiptUrl:", receiptUrl);

    onSubmit({
      date,
      category,
      amount,
      description,
      personName,
      receiptUrl: receiptUrl || undefined,
    });
  };

  if (!isOpen) return null;

  const isImage = receiptPreview?.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i);
  const isPdf = receiptPreview?.match(/\.pdf(\?|$)/i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md mx-4 glass-card border border-border-light animate-fade-in-scale">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                isEntry ? "bg-gold-dim" : "bg-ruby-dim"
              )}
            >
              {isEntry ? (
                <ArrowDownLeft className="w-5 h-5 text-gold" />
              ) : (
                <ArrowUpRight className="w-5 h-5 text-ruby" />
              )}
            </div>
            <div>
              <h2 className="text-zinc-100 font-semibold">
                {isEditing
                  ? isEntry
                    ? "Editar Entrada"
                    : "Editar Despesa"
                  : isEntry
                    ? "Nova Entrada"
                    : "Nova Despesa"}
              </h2>
              <p className="text-zinc-500 text-xs">
                {isEditing
                  ? "Altere os dados do lançamento"
                  : "Preencha os dados do lançamento"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-zinc-400 text-sm mb-2">Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-sm mb-2">
              {isEntry ? "Nome de quem fez a oferta" : "Nome de quem fez a despesa"}
            </label>
            <input
              type="text"
              placeholder={isEntry ? "Ex: João Silva" : "Ex: Maria Santos"}
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-sm mb-2">
              Categoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {categoryLabels[cat as keyof typeof categoryLabels]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 text-sm mb-2">
              Valor (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                R$
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0,00"
                value={amountDisplay}
                onChange={handleAmountChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 text-sm mb-2">
              Descrição (opcional)
            </label>
            <textarea
              rows={3}
              placeholder="Adicione uma descrição..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Receipt Upload */}
          {tenantId && (
            <div className="space-y-2">
              <label className="block text-zinc-400 text-sm mb-2">
                Comprovante (opcional)
              </label>

              {receiptPreview ? (
                <div className="relative group">
                  {isImage ? (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden border border-border">
                      <img
                        src={receiptPreview}
                        alt="Comprovante"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={handleRemoveReceipt}
                          disabled={isLoading}
                          className="p-2 bg-ruby rounded-lg text-white hover:bg-ruby/90 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : isPdf ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-white/[0.02]">
                      <div className="flex-1 min-w-0">
                        <p className="text-zinc-300 text-sm truncate">
                          Comprovante PDF
                        </p>
                        <p className="text-zinc-500 text-xs">PDF</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveReceipt}
                        disabled={isLoading}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-ruby hover:bg-ruby-dim transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div
                  onClick={() => !isLoading && !isUploading && fileInputRef.current?.click()}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-border hover:border-border-light transition-colors cursor-pointer",
                    (isLoading || isUploading) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isUploading ? (
                    <p className="text-zinc-500 text-sm">Enviando...</p>
                  ) : (
                    <>
                      <p className="text-zinc-500 text-sm">
                        Clique para selecionar arquivo
                      </p>
                      <p className="text-zinc-600 text-xs">
                        JPG, PNG, WEBP, GIF ou PDF (max 5MB)
                      </p>
                    </>
                  )}
                </div>
              )}

              {uploadError && (
                <p className="text-ruby text-xs">{uploadError}</p>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isLoading || isUploading}
              />
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="p-3 rounded-xl bg-ruby-dim border border-ruby/20">
              <p className="text-ruby text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border text-zinc-400 text-sm font-medium hover:text-zinc-200 hover:border-border-light transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || isUploading || !category || parseCurrencyValue(amountDisplay) <= 0}
              className={cn(
                "flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                isEntry
                  ? "bg-gold text-black hover:bg-gold/90"
                  : "bg-ruby text-white hover:bg-ruby/90"
              )}
            >
              {isLoading
                ? "Salvando..."
                : isEditing
                  ? "Atualizar"
                  : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
