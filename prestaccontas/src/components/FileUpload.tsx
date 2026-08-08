"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, File, Image, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onUpload: (url: string) => void;
  onRemove: () => void;
  currentUrl?: string;
  disabled?: boolean;
  tenantId: string;
}

export default function FileUpload({
  onUpload,
  onRemove,
  currentUrl,
  disabled,
  tenantId,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincronizar preview com currentUrl
  useEffect(() => {
    setPreview(currentUrl || null);
  }, [currentUrl]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Tipo de arquivo não permitido. Use: JPG, PNG, WEBP, GIF ou PDF");
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Arquivo muito grande. Tamanho máximo: 5MB");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Criar FormData para upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tenantId", tenantId);

      console.log("Fazendo upload do arquivo:", file.name);

      // Fazer upload via API
      const response = await fetch("/api/upload-receipt", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao fazer upload");
      }

      console.log("Upload concluído:", data.url);
      setPreview(data.url);
      onUpload(data.url);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao fazer upload do arquivo";
      setError(errorMessage);
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    onRemove();
  };

  const isImage = preview?.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i);
  const isPdf = preview?.match(/\.pdf(\?|$)/i);

  return (
    <div className="space-y-2">
      <label className="block text-zinc-400 text-sm mb-2">
        Comprovante (opcional)
      </label>

      {preview ? (
        <div className="relative group">
          {isImage ? (
            <div className="relative w-full h-32 rounded-xl overflow-hidden border border-border">
              <img
                src={preview}
                alt="Comprovante"
                className="w-full h-full object-cover"
                onError={() => setError("Erro ao carregar preview da imagem")}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={disabled}
                  className="p-2 bg-ruby rounded-lg text-white hover:bg-ruby/90 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : isPdf ? (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-white/[0.02]">
              <File className="w-8 h-8 text-gold" />
              <div className="flex-1 min-w-0">
                <p className="text-zinc-300 text-sm truncate">
                  {preview.split("/").pop()?.split("?")[0]}
                </p>
                <p className="text-zinc-500 text-xs">PDF</p>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-ruby hover:bg-ruby-dim transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-border hover:border-border-light transition-colors cursor-pointer",
            disabled && "opacity-50 cursor-not-allowed",
            isUploading && "pointer-events-none"
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-6 h-6 text-gold animate-spin" />
              <p className="text-zinc-500 text-sm">Enviando...</p>
            </>
          ) : (
            <>
              <Upload className="w-6 h-6 text-zinc-500" />
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

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-ruby-dim border border-ruby/20">
          <AlertCircle className="w-4 h-4 text-ruby mt-0.5 shrink-0" />
          <div>
            <p className="text-ruby text-sm font-medium">Erro no upload</p>
            <p className="text-ruby/80 text-xs mt-1">{error}</p>
            {error.includes("Bucket") && (
              <p className="text-ruby/60 text-xs mt-2">
                Execute o script setup_receipts_bucket.sql no Supabase SQL Editor
              </p>
            )}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  );
}
