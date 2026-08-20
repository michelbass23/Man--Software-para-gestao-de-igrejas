"use client";

import { useState } from "react";
import { Loader2, Check, CreditCard, Shield, ArrowRight, LogOut } from "lucide-react";
import { signOut } from "@/app/login/actions";

type Plan = "monthly" | "annual";

const plans = {
  monthly: {
    name: "Mensal",
    price: 147,
    period: "/mês",
    description: "Cancele quando quiser",
    features: [
      "Controle financeiro completo",
      "Gestão de membros",
      "Relatórios detalhados",
      "Eventos e agenda",
      "Suporte prioritário",
    ],
  },
  annual: {
    name: "Anual",
    price: 1470,
    period: "/ano",
    description: "Economize 2 meses",
    features: [
      "Tudo do plano Mensal",
      "2 meses grátis",
      "Suporte VIP",
      "Atualizações prioritárias",
    ],
  },
};

export default function AssinaturaPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan>("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePayment() {
    setLoading(true);
    setError(null);

    try {
      // Mensal → Preapproval (recorrência real)
      // Anual → Checkout Pro (pagamento único)
      const endpoint =
        selectedPlan === "monthly"
          ? "/api/subscription/create"
          : "/api/payment/create";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao criar pagamento");
        setLoading(false);
        return;
      }

      // Usar init_point (produção) ou sandbox_init_point (teste)
      const checkoutUrl = data.init_point || data.sandbox_init_point;
      if (!checkoutUrl) {
        setError("Erro: URL de checkout não retornada. Verifique as credenciais do Mercado Pago.");
        setLoading(false);
        return;
      }

      window.location.href = checkoutUrl;
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
            PrestaContas
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

        {/* Planos */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {(Object.keys(plans) as Plan[]).map((planKey) => {
            const plan = plans[planKey];
            const isSelected = selectedPlan === planKey;
            const isAnnual = planKey === "annual";

            return (
              <button
                key={planKey}
                onClick={() => setSelectedPlan(planKey)}
                className={`relative p-5 rounded-2xl border-2 text-left transition-all ${
                  isSelected
                    ? "border-gold bg-gold/5"
                    : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                }`}
              >
                {isAnnual && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gold text-black text-xs font-bold rounded-full">
                    -17%
                  </span>
                )}

                <div className="mb-3">
                  <span
                    className={`text-sm font-medium ${
                      isSelected ? "text-gold" : "text-zinc-400"
                    }`}
                  >
                    {plan.name}
                  </span>
                </div>

                <div className="mb-1">
                  <span className="text-2xl font-bold text-zinc-100">
                    R$ {plan.price}
                  </span>
                  <span className="text-zinc-500 text-sm">{plan.period}</span>
                </div>

                <p className="text-zinc-500 text-xs">{plan.description}</p>

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
            {plans[selectedPlan].features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
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
            Pagamento seguro via Mercado Pago
          </p>
        </div>

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
    </div>
  );
}
