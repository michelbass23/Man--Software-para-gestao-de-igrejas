"use client";

import { useState, useEffect } from "react";
import { QrCode, Copy, Check, Loader2, Trash2, CreditCard, ExternalLink, Share2 } from "lucide-react";
import PixQrCode from "./PixQrCode";
import { generatePixPayload, pixKeyTypeLabel, formatPixKey } from "@/lib/pix";
import { getPixConfig, savePixConfig, removePixConfig } from "@/app/dashboard/settings/actions";
import { showError, showSuccess } from "@/lib/alerts";

interface PixConfig {
  pix_key: string | null;
  pix_key_type: string | null;
  name: string;
  slug: string;
}

const KEY_TYPES = [
  { value: "cpf", label: "CPF", placeholder: "000.000.000-00", inputMode: "numeric" as const },
  { value: "cnpj", label: "CNPJ", placeholder: "00.000.000/0000-00", inputMode: "numeric" as const },
  { value: "email", label: "E-mail", placeholder: "igreja@email.com", inputMode: "email" as const },
  { value: "phone", label: "Telefone", placeholder: "(00) 00000-0000", inputMode: "tel" as const },
  { value: "random", label: "Chave aleatória", placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", inputMode: "text" as const },
];

export default function PixSettings() {
  const [config, setConfig] = useState<PixConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Form state
  const [keyType, setKeyType] = useState("cpf");
  const [keyValue, setKeyValue] = useState("");
  const [copied, setCopied] = useState(false);

  // If already configured, we're in "view" mode
  const isConfigured = !!config?.pix_key;

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setIsLoading(true);
    const data = await getPixConfig();
    setConfig(data);
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await savePixConfig(keyValue, keyType);
    if (result.error) {
      showError("Erro ao salvar PIX", result.error);
    } else {
      showSuccess("PIX configurado!", "QR Code gerado com sucesso.");
      await loadConfig();
    }
    setIsSaving(false);
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    const result = await removePixConfig();
    if (result.error) {
      showError("Erro ao remover PIX", result.error);
    } else {
      setConfig(null);
      setKeyValue("");
      setKeyType("cpf");
      showSuccess("PIX removido", "A chave PIX foi removida com sucesso.");
    }
    setIsRemoving(false);
  };

  const handleCopyPayload = () => {
    if (!config?.pix_key || !config?.pix_key_type) return;
    const payload = generatePixPayload({
      key: config.pix_key,
      keyType: config.pix_key_type,
      merchantName: config.name,
      merchantCity: "SAO PAULO",
    });
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = () => {
    if (config?.pix_key && config?.pix_key_type) {
      setKeyType(config.pix_key_type);
      setKeyValue(config.pix_key);
    }
    // Clear config to show form
    setConfig((prev) => prev ? { ...prev, pix_key: null, pix_key_type: null } : null);
  };

  const selectedType = KEY_TYPES.find((t) => t.value === keyType);

  if (isLoading) {
    return (
      <div className="glass-card p-4 md:p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <QrCode className="w-4 h-4 md:w-5 md:h-5 text-gold" />
          <h2 className="text-base md:text-lg font-semibold text-strong">
            Doações via PIX
          </h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-gold animate-spin" />
        </div>
      </div>
    );
  }

  // VIEW MODE - QR Code already generated
  if (isConfigured) {
    const payload = generatePixPayload({
      key: config!.pix_key!,
      keyType: config!.pix_key_type!,
      merchantName: config!.name,
      merchantCity: "SAO PAULO",
    });

    return (
      <div className="glass-card p-4 md:p-6 mb-6 opacity-0 animate-fade-in stagger-3">
        <div className="flex items-center gap-2 mb-3 md:mb-4">
          <QrCode className="w-4 h-4 md:w-5 md:h-5 text-gold" />
          <h2 className="text-base md:text-lg font-semibold text-strong">
            Doações via PIX
          </h2>
        </div>

        <p className="text-subtle text-xs md:text-sm mb-5">
          QR Code configurado para receber doações. Compartilhe com os membros da igreja.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* QR Code */}
          <div className="flex-shrink-0 p-4 bg-white rounded-2xl">
            <PixQrCode payload={payload} size={200} />
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4 w-full">
            <div>
              <p className="text-subtle text-xs mb-1">Tipo de chave</p>
              <p className="text-strong text-sm font-medium">
                {pixKeyTypeLabel(config!.pix_key_type!)}
              </p>
            </div>
            <div>
              <p className="text-subtle text-xs mb-1">Chave PIX</p>
              <p className="text-strong text-sm font-mono">
                {formatPixKey(config!.pix_key!, config!.pix_key_type!)}
              </p>
            </div>

            {/* Public Link */}
            <div className="bg-surface rounded-xl p-3 border border-border">
              <p className="text-subtle text-[10px] mb-1">Link para projetor / compartilhar</p>
              <div className="flex items-center gap-2">
                <code className="text-gold text-xs flex-1 truncate">
                  {typeof window !== "undefined" ? `${window.location.origin}/doar/${config!.slug}` : ""}
                </code>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/doar/${config!.slug}`;
                    navigator.clipboard.writeText(url);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gold/10 transition-colors"
                  title="Copiar link"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gold" />}
                </button>
                <a
                  href={`/doar/${config!.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gold/10 transition-colors"
                  title="Abrir página de doação"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-gold" />
                </a>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2">
              <a
                href={`/doar/${config!.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gold text-black text-sm font-medium hover:bg-gold/90 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Abrir no projetor
              </a>

              <button
                onClick={handleCopyPayload}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-muted text-sm font-medium hover:text-strong hover:border-border-light transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copiado!" : "Copiar código PIX"}
              </button>

              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-muted text-sm font-medium hover:text-strong hover:border-border-light transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                Alterar chave
              </button>

              <button
                onClick={handleRemove}
                disabled={isRemoving}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-muted text-sm font-medium hover:text-ruby hover:border-ruby/30 transition-colors disabled:opacity-50"
              >
                {isRemoving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Remover
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FORM MODE - Configure PIX
  return (
    <div className="glass-card p-4 md:p-6 mb-6 opacity-0 animate-fade-in stagger-3">
      <div className="flex items-center gap-2 mb-3 md:mb-4">
        <QrCode className="w-4 h-4 md:w-5 md:h-5 text-gold" />
        <h2 className="text-base md:text-lg font-semibold text-strong">
          Doações via PIX
        </h2>
      </div>

      <p className="text-subtle text-xs md:text-sm mb-5">
        Cadastre a chave PIX da igreja para gerar um QR Code de doações.
        Basta informar o tipo da chave e o valor — o sistema gera o QR Code automaticamente.
      </p>

      <div className="space-y-4 max-w-md">
        {/* Key Type Selector */}
        <div>
          <label className="block text-subtle text-xs mb-2">Tipo de chave</label>
          <div className="flex flex-wrap gap-2">
            {KEY_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => {
                  setKeyType(type.value);
                  setKeyValue("");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  keyType === type.value
                    ? "bg-gold text-black"
                    : "bg-surface border border-border text-muted hover:text-strong"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Key Value Input */}
        <div>
          <label className="block text-subtle text-xs mb-2">
            Chave {selectedType?.label}
          </label>
          <input
            type="text"
            inputMode={selectedType?.inputMode}
            value={keyValue}
            onChange={(e) => setKeyValue(e.target.value)}
            placeholder={selectedType?.placeholder}
            className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-strong text-sm placeholder:text-faint focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-colors"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving || !keyValue.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold text-black text-sm font-medium hover:bg-gold/90 transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <QrCode className="w-4 h-4" />
          )}
          {isSaving ? "Salvando..." : "Gerar QR Code"}
        </button>

        {/* Preview while typing */}
        {keyValue.trim() && (
          <div className="pt-2">
            <p className="text-subtle text-xs mb-2">Preview:</p>
            <div className="p-3 bg-white rounded-xl inline-block">
              <PixQrCode
                payload={generatePixPayload({
                  key: keyValue,
                  keyType,
                  merchantName: config?.name || "IGREJA",
                  merchantCity: "SAO PAULO",
                })}
                size={160}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}