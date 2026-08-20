"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, CreditCard, QrCode } from "lucide-react";

type PlanOption = "monthly" | "annual";

export function SubscribeButton() {
  const [loading, setLoading] = useState<PlanOption | null>(null);
  const router = useRouter();

  const handleSubscribe = async (plan: PlanOption, endpoint: string) => {
    setLoading(plan);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login?redirect=/assinatura");
        return;
      }

      if (!response.ok) {
        alert(data.error || "Erro ao processar pagamento");
        return;
      }

      const checkoutUrl = data.init_point || data.sandbox_init_point;
      if (!checkoutUrl) {
        alert("Erro: URL de checkout não retornada. Verifique as credenciais do Mercado Pago.");
        return;
      }
      window.location.href = checkoutUrl;
    } catch {
      alert("Erro ao processar. Tente novamente.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Assinatura mensal - Cartão */}
      <button
        onClick={() =>
          handleSubscribe("monthly", "/api/subscription/create")
        }
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gold text-black text-base font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading === "monthly" ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Assinar Mensal — R$147/mês
          </>
        )}
      </button>

      {/* Pagamento anual - PIX, Cartão, Boleto */}
      <button
        onClick={() => handleSubscribe("annual", "/api/payment/create")}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-gold/30 text-gold text-base font-semibold hover:bg-gold/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading === "annual" ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <QrCode className="w-5 h-5" />
            Pagar Anual — R$1.470/ano (PIX, Cartão ou Boleto)
          </>
        )}
      </button>

      <p className="text-center text-zinc-500 text-xs">
        Pagamento seguro via Mercado Pago
      </p>
    </div>
  );
}
