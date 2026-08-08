"use client";

import { useState, useEffect, useRef } from "react";
import { Settings, Upload, X, Church, Loader2 } from "lucide-react";
import Image from "next/image";
import { getTenantSettings, uploadLogo, removeLogo } from "./actions";

interface TenantSettings {
  id: string;
  name: string;
  logo_url: string | null;
}

export default function SettingsPage() {
  const [tenant, setTenant] = useState<TenantSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    const data = await getTenantSettings();
    setTenant(data);
    setIsLoading(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);
    setIsUploading(true);

    const result = await uploadLogo(file);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess("Logo atualizada com sucesso!");
      await loadSettings();
    }

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveLogo = async () => {
    setError(null);
    setSuccess(null);

    const result = await removeLogo();

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess("Logo removida com sucesso!");
      await loadSettings();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header - Responsivo */}
      <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-8 opacity-0 animate-fade-in">
        <Settings className="w-5 h-5 md:w-6 md:h-6 text-gold" />
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-zinc-100 tracking-tight">
            Configurações
          </h1>
          <p className="text-zinc-500 text-xs md:text-sm mt-1">
            Personalize as configurações da sua igreja
          </p>
        </div>
      </div>

      {/* Logo Section - Responsivo */}
      <div className="glass-card p-4 md:p-6 mb-6 opacity-0 animate-fade-in stagger-1">
        <h2 className="text-base md:text-lg font-semibold text-zinc-100 mb-3 md:mb-4">
          Logo da Igreja
        </h2>
        <p className="text-zinc-500 text-xs md:text-sm mb-4 md:mb-6">
          A logo aparecerá no menu lateral do dashboard. Recomendado: imagem quadrada, mínimo 100x100px.
        </p>

        <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6">
          {/* Preview */}
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-zinc-900/50 flex-shrink-0">
            {tenant?.logo_url ? (
              <Image
                src={tenant.logo_url}
                alt="Logo da igreja"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <Church className="w-8 h-8 md:w-10 md:h-10 text-zinc-600" />
            )}
          </div>

          {/* Actions */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-black text-sm font-medium hover:bg-gold/90 transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {isUploading ? "Enviando..." : "Enviar logo"}
              </button>

              {tenant?.logo_url && (
                <button
                  onClick={handleRemoveLogo}
                  disabled={isUploading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-zinc-400 text-sm font-medium hover:text-ruby hover:border-ruby/30 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Remover
                </button>
              )}
            </div>

            <p className="text-zinc-600 text-[10px] md:text-xs">
              JPG, PNG, WEBP ou SVG. Máximo 5MB.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
        </div>

        {/* Messages */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-ruby-dim border border-ruby/20">
            <p className="text-ruby text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-emerald-400 text-sm">{success}</p>
          </div>
        )}
      </div>

      {/* Info Section - Responsivo */}
      <div className="glass-card p-4 md:p-6 opacity-0 animate-fade-in stagger-2">
        <h2 className="text-base md:text-lg font-semibold text-zinc-100 mb-3 md:mb-4">
          Informações da Igreja
        </h2>
        <div className="space-y-3">
          <div>
            <p className="text-zinc-500 text-[10px] md:text-xs mb-1">Nome</p>
            <p className="text-zinc-200 text-sm">{tenant?.name || "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
