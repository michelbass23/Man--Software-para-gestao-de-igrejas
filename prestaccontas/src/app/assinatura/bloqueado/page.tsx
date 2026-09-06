"use client";

import { useState } from "react";
import { Lock, Loader2, LogOut } from "lucide-react";
import { signOut } from "@/app/login/actions";
import WhatsAppFloatButton from "@/components/WhatsAppFloatButton";
import { showError } from "@/lib/alerts";

export default function SubscriptionBlockedPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleRegularize = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/subscription/checkout-url");
      const data = await response.json();

      if (!response.ok || !data.checkoutUrl) {
        showError("Erro", data.error || "Não foi possível gerar o link de pagamento.");
        setIsLoading(false);
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch {
      showError("Erro", "Não foi possível conectar. Tente novamente.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="glass-card p-8 md:p-12 rounded-2xl max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-ruby-dim flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-ruby" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-100 mb-3">
          Acesso suspenso
        </h1>
        <p className="text-zinc-400 mb-8">
          Sua assinatura está com o pagamento em atraso há mais tempo do que o
          período de carência. Regularize a fatura para reativar o acesso ao
          sistema.
        </p>

        <button
          onClick={handleRegularize}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gold text-black text-sm font-semibold hover:bg-gold/90 transition-all disabled:opacity-50 mb-3"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Pagar fatura pendente
        </button>

        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-zinc-500 text-sm hover:text-zinc-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair da conta
          </button>
        </form>
      </div>

      <WhatsAppFloatButton message="Olá! Minha conta foi bloqueada por falta de pagamento e preciso de ajuda." />
    </div>
  );
}
