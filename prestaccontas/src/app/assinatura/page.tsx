"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function AssinaturaPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function createSubscription() {
      try {
        const response = await fetch("/api/subscription/create", {
          method: "POST",
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Erro ao criar assinatura");
          return;
        }

        // Redirecionar para o checkout do Mercado Pago
        window.location.href = data.init_point;
      } catch {
        setError("Erro ao processar. Tente novamente.");
      }
    }

    createSubscription();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="glass-card p-8 md:p-12 rounded-2xl max-w-md w-full text-center">
          <p className="text-ruby mb-4">{error}</p>
          <a
            href="/#pricing"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gold text-black text-sm font-semibold hover:bg-gold/90 transition-colors"
          >
            Tentar Novamente
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="glass-card p-8 md:p-12 rounded-2xl max-w-md w-full text-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold mx-auto mb-4" />
        <p className="text-zinc-300">Preparando sua assinatura...</p>
        <p className="text-zinc-500 text-sm mt-2">
          Você será redirecionado para o pagamento.
        </p>
      </div>
    </div>
  );
}
