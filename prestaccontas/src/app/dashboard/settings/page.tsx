"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Settings, Upload, X, Church, Loader2, Palette, ShieldCheck, Download, ExternalLink, Bell, BellOff, Send } from "lucide-react";
import Image from "next/image";
import { getTenantSettings, uploadLogo, removeLogo, exportAllTenantData } from "./actions";
import { sendTestPush } from "./push-actions";
import ThemeToggle from "@/components/ThemeToggle";
import { downloadJSON, fileDateSuffix } from "@/lib/csv";
import { showError, showSuccess } from "@/lib/alerts";
import {
  isPushSupported,
  getCurrentPushSubscription,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push-client";

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
  const [isExportingData, setIsExportingData] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [isTogglingPush, setIsTogglingPush] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);

  useEffect(() => {
    if (!isPushSupported()) return;
    getCurrentPushSubscription().then((sub) => {
      setPushSupported(true);
      setPushSubscribed(!!sub);
    });
  }, []);

  const handleTogglePush = async () => {
    setIsTogglingPush(true);
    const result = pushSubscribed
      ? await unsubscribeFromPush()
      : await subscribeToPush();

    if (result.error) {
      showError("Notificações", result.error);
    } else {
      setPushSubscribed(!pushSubscribed);
      if (!pushSubscribed) showSuccess("Notificações ativadas!");
    }
    setIsTogglingPush(false);
  };

  const handleSendTestPush = async () => {
    setIsSendingTest(true);
    const result = await sendTestPush();
    if (result.error) {
      showError("Teste de notificação", result.error);
    } else {
      showSuccess("Notificação enviada!", "Deve chegar em alguns segundos.");
    }
    setIsSendingTest(false);
  };

  const handleExportAllData = async () => {
    setIsExportingData(true);
    try {
      const data = await exportAllTenantData();
      const slug = (tenant?.name || "igreja")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .toLowerCase();
      downloadJSON(`prestacontas-dados-${slug}-${fileDateSuffix()}.json`, data);
    } catch {
      showError("Erro ao exportar", "Não foi possível gerar o arquivo de dados.");
    } finally {
      setIsExportingData(false);
    }
  };

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
          <h1 className="text-xl md:text-2xl font-semibold text-strong tracking-tight">
            Configurações
          </h1>
          <p className="text-subtle text-xs md:text-sm mt-1">
            Personalize as configurações da sua igreja
          </p>
        </div>
      </div>

      {/* Logo Section - Responsivo */}
      <div className="glass-card p-4 md:p-6 mb-6 opacity-0 animate-fade-in stagger-1">
        <h2 className="text-base md:text-lg font-semibold text-strong mb-3 md:mb-4">
          Logo da Igreja
        </h2>
        <p className="text-subtle text-xs md:text-sm mb-4 md:mb-6">
          A logo aparecerá no menu lateral do dashboard. Recomendado: imagem quadrada, mínimo 100x100px.
        </p>

        <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6">
          {/* Preview */}
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-surface flex-shrink-0">
            {tenant?.logo_url ? (
              <Image
                src={tenant.logo_url}
                alt="Logo da igreja"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <Church className="w-8 h-8 md:w-10 md:h-10 text-faint" />
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
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-muted text-sm font-medium hover:text-ruby hover:border-ruby/30 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Remover
                </button>
              )}
            </div>

            <p className="text-faint text-[10px] md:text-xs">
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

      {/* Aparência - Tema */}
      <div className="glass-card p-4 md:p-6 mb-6 opacity-0 animate-fade-in stagger-2">
        <div className="flex items-center gap-2 mb-3 md:mb-4">
          <Palette className="w-4 h-4 md:w-5 md:h-5 text-gold" />
          <h2 className="text-base md:text-lg font-semibold text-strong">
            Aparência
          </h2>
        </div>
        <p className="text-subtle text-xs md:text-sm mb-4">
          Escolha o tema da interface. &quot;Sistema&quot; acompanha a
          configuração do seu dispositivo.
        </p>
        <ThemeToggle variant="segmented" className="flex-wrap" />
      </div>

      {/* Notificações */}
      <div className="glass-card p-4 md:p-6 mb-6 opacity-0 animate-fade-in stagger-2">
        <div className="flex items-center gap-2 mb-3 md:mb-4">
          <Bell className="w-4 h-4 md:w-5 md:h-5 text-gold" />
          <h2 className="text-base md:text-lg font-semibold text-strong">
            Notificações
          </h2>
        </div>

        {!pushSupported ? (
          <p className="text-subtle text-xs md:text-sm">
            Seu navegador não suporta notificações. No iPhone, instale o app na
            tela de início (Compartilhar → Adicionar à Tela de Início) e abra por
            lá pra ativar.
          </p>
        ) : (
          <>
            <p className="text-subtle text-xs md:text-sm mb-4">
              Receba avisos de despesa fixa vencendo direto no navegador ou
              celular, mesmo com o sistema fechado. Ativa só neste dispositivo.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleTogglePush}
                disabled={isTogglingPush}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-black text-sm font-medium hover:bg-gold/90 transition-colors disabled:opacity-50"
              >
                {isTogglingPush ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : pushSubscribed ? (
                  <BellOff className="w-4 h-4" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
                {pushSubscribed ? "Desativar notificações" : "Ativar notificações"}
              </button>

              {pushSubscribed && (
                <button
                  onClick={handleSendTestPush}
                  disabled={isSendingTest}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-muted text-sm font-medium hover:text-strong hover:border-border-light transition-colors disabled:opacity-50"
                >
                  {isSendingTest ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Enviar teste
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Privacidade e Dados (LGPD) */}
      <div className="glass-card p-4 md:p-6 mb-6 opacity-0 animate-fade-in stagger-3">
        <div className="flex items-center gap-2 mb-3 md:mb-4">
          <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-gold" />
          <h2 className="text-base md:text-lg font-semibold text-strong">
            Privacidade e Dados (LGPD)
          </h2>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <p className="text-strong font-medium mb-1">Portabilidade — exportar todos os dados</p>
            <p className="text-subtle text-xs md:text-sm mb-3">
              Baixe um arquivo com todos os dados da sua igreja (membros, entradas,
              despesas, eventos e presenças) em formato aberto (JSON).
            </p>
            <button
              onClick={handleExportAllData}
              disabled={isExportingData}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-muted text-sm font-medium hover:text-strong hover:border-border-light transition-colors disabled:opacity-50"
            >
              {isExportingData ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isExportingData ? "Gerando..." : "Baixar todos os dados (JSON)"}
            </button>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-strong font-medium mb-1">Exclusão de dados</p>
            <ul className="text-subtle text-xs md:text-sm list-disc pl-5 space-y-1">
              <li>
                <span className="text-muted">Dados de um membro:</span> vá em{" "}
                <Link href="/dashboard/members" className="text-gold hover:underline">
                  Membros
                </Link>{" "}
                e use &quot;Excluir&quot; — a remoção é definitiva.
              </li>
              <li>
                <span className="text-muted">Um lançamento financeiro:</span> exclua na
                página de Entradas ou Despesas.
              </li>
              <li>
                <span className="text-muted">Encerrar a conta e apagar tudo:</span>{" "}
                solicite pelo WhatsApp{" "}
                <a
                  href="https://wa.me/5571999445787?text=Solicito%20a%20exclus%C3%A3o%20da%20minha%20conta%20e%20dados%20(LGPD)."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold hover:underline"
                >
                  (71) 99944-5787
                </a>
                . O pedido é atendido em até 15 dias.
              </li>
            </ul>
          </div>

          <div className="border-t border-border pt-4">
            <Link
              href="/privacidade"
              target="_blank"
              className="inline-flex items-center gap-2 text-gold text-sm hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              Ver Política de Privacidade completa
            </Link>
          </div>
        </div>
      </div>

      {/* Info Section - Responsivo */}
      <div className="glass-card p-4 md:p-6 opacity-0 animate-fade-in stagger-4">
        <h2 className="text-base md:text-lg font-semibold text-strong mb-3 md:mb-4">
          Informações da Igreja
        </h2>
        <div className="space-y-3">
          <div>
            <p className="text-subtle text-[10px] md:text-xs mb-1">Nome</p>
            <p className="text-strong text-sm">{tenant?.name || "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
