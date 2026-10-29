"use client";

import { useState } from "react";
import { Loader2, Check, CreditCard, Shield, ArrowRight, LogOut, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { signOut } from "@/app/login/actions";
import WhatsAppFloatButton from "@/components/WhatsAppFloatButton";

type Plan = "starter_monthly" | "starter_annual" | "monthly" | "annual";

const plans = {
  starter_monthly: {
    name: "Essencial",
    price: 59,
    period: "/mês",
    description: "Para igrejas pequenas",
    features: [
      "Até 150 membros",
      "Controle financeiro completo",
      "Eventos e agenda",
      "Check-in por QR Code",
      "Relatórios em PDF",
    ],
  },
  starter_annual: {
    name: "Essencial",
    price: 590,
    period: "/ano",
    description: "Economize 2 meses",
    features: [
      "Tudo do Essencial Mensal",
      "2 meses grátis",
    ],
  },
  monthly: {
    name: "Completo",
    price: 147,
    period: "/mês",
    description: "Para igrejas em crescimento",
    features: [
      "Membros ilimitados",
      "Controle financeiro completo",
      "Relatórios detalhados",
      "Eventos e agenda",
      "Equipe com múltiplos usuários",
      "Suporte prioritário",
    ],
  },
  annual: {
    name: "Completo",
    price: 1470,
    period: "/ano",
    description: "Economize 2 meses",
    features: [
      "Tudo do Completo Mensal",
      "2 meses grátis",
      "Suporte VIP",
      "Atualizações prioritárias",
    ],
  },
};

function formatCpfCnpj(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

export default function AssinaturaPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");
  const [selectedTier, setSelectedTier] = useState<"starter" | "pro">("pro");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPlan: Plan =
    selectedTier === "starter"
      ? billingPeriod === "annual"
        ? "starter_annual"
        : "starter_monthly"
      : billingPeriod === "annual"
        ? "annual"
        : "monthly";

  const currentPlan = plans[selectedPlan];

  async function handlePayment() {
    setError(null);

    const digits = cpfCnpj.replace(/\D/g, "");
    if (digits.length !== 11 && digits.length !== 14) {
      setError("Informe um CPF ou CNPJ válido");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/subscription/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          cpfCnpj: digits,
          phone: phone.replace(/\D/g, "") || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao criar pagamento");
        setLoading(false);
        return;
      }

      if (!data.checkoutUrl) {
        setError("Erro: URL de checkout não retornada. Verifique as credenciais da Asaas.");
        setLoading(false);
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error("Erro ao processar pagamento:", err);
      setError("Erro ao processar. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center">
            <span className="text-black font-bold text-lg">P</span>
          </div>
          <span className="text-xl font-semibold text-zinc-100">
            Maná Sistemas
          </span>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-zinc-100 mb-2">
            Escolha seu plano
          </h1>
          <p className="text-zinc-400 text-sm">
            Comece agora a gerenciar as finanças da sua igreja
          </p>
        </div>

        {/* Voltar ao painel (trial ativo) */}
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-gold/30 text-gold text-sm font-medium hover:bg-gold/10 transition-all mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Continuar com o teste grátis
          <Sparkles className="w-4 h-4" />
        </Link>

        {/* Toggle mensal/anual */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <button
            onClick={() => setBillingPeriod("monthly")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              billingPeriod === "monthly"
                ? "bg-gold text-black"
                : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setBillingPeriod("annual")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              billingPeriod === "annual"
                ? "bg-gold text-black"
                : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
            }`}
          >
            Anual{" "}
            <span className="text-xs opacity-80">-17%</span>
          </button>
        </div>

        {/* Planos */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {(["starter", "pro"] as const).map((tier) => {
            const planKey: Plan =
              tier === "starter"
                ? billingPeriod === "annual"
                  ? "starter_annual"
                  : "starter_monthly"
                : billingPeriod === "annual"
                  ? "annual"
                  : "monthly";
            const plan = plans[planKey];
            const isSelected = selectedTier === tier;
            const isPro = tier === "pro";

            return (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`relative p-5 rounded-2xl border-2 text-left transition-all ${
                  isSelected
                    ? "border-gold bg-gold/5"
                    : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                }`}
              >
                {isPro && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gold text-black text-xs font-bold rounded-full">
                    Mais popular
                  </span>
                )}

                <div className="mb-3">
                  <span
                    className={`text-sm font-semibold ${
                      isSelected ? "text-gold" : "text-zinc-300"
                    }`}
                  >
                    {plan.name}
                  </span>
                  <p className="text-zinc-500 text-xs mt-0.5">{plan.description}</p>
                </div>

                <div className="mb-1">
                  <span className="text-2xl font-bold text-zinc-100">
                    R$ {plan.price}
                  </span>
                  <span className="text-zinc-500 text-sm">{plan.period}</span>
                </div>

                {isPro && (
                  <p className="text-emerald-400 text-xs font-medium mt-1">
                    Membros ilimitados
                  </p>
                )}
                {!isPro && (
                  <p className="text-zinc-400 text-xs font-medium mt-1">
                    Até 150 membros
                  </p>
                )}

                {isSelected && (
                  <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
                    <Check className="w-3 h-3 text-black" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Features */}
        <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/30 mb-6">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">
            Incluído no plano:
          </h3>
          <ul className="space-y-2">
            {currentPlan.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Dados de cobrança */}
        <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/30 mb-6 space-y-4">
          <h3 className="text-sm font-medium text-zinc-300">
            Dados de cobrança
          </h3>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">
              CPF ou CNPJ *
            </label>
            <input
              type="text"
              value={cpfCnpj}
              onChange={(e) => setCpfCnpj(formatCpfCnpj(e.target.value))}
              placeholder="000.000.000-00"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-gold/50"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">
              Telefone (opcional)
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(00) 00000-0000"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-gold/50"
            />
          </div>
        </div>

        {/* Erro */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-800/50">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Botão de pagamento */}
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gold text-black text-sm font-bold hover:bg-gold/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Assinar agora
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Segurança */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <Shield className="w-4 h-4 text-zinc-600" />
          <p className="text-zinc-600 text-xs">
            Pagamento seguro via Asaas
          </p>
        </div>

        <p className="text-center text-zinc-600 text-[11px] mt-3">
          Ao assinar, você concorda com os{" "}
          <Link href="/termos" target="_blank" className="text-gold hover:underline">
            Termos de Uso
          </Link>{" "}
          e a{" "}
          <Link href="/privacidade" target="_blank" className="text-gold hover:underline">
            Política de Privacidade
          </Link>
          .
        </p>

        {/* Métodos de pagamento */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <span className="text-zinc-600 text-xs">PIX</span>
          <span className="text-zinc-700">•</span>
          <span className="text-zinc-600 text-xs">Cartão de Crédito</span>
          <span className="text-zinc-700">•</span>
          <span className="text-zinc-600 text-xs">Boleto</span>
        </div>

        {/* Logout */}
        <form action={signOut} className="mt-6 text-center">
          <button
            type="submit"
            className="inline-flex items-center gap-2 text-zinc-600 text-xs hover:text-zinc-400 transition-colors"
          >
            <LogOut className="w-3 h-3" />
            Sair da conta
          </button>
        </form>
      </div>

      <WhatsAppFloatButton message="Olá! Estou com dúvida na hora de assinar o Maná Sistemas." />
    </div>
  );
}
