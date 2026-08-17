"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

export function SubscribeButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/subscription/create", {
        method: "POST",
      });

      const data = await response.json();

      // Se não estiver logado, redirecionar para o login
      if (response.status === 401) {
        router.push("/login?redirect=/assinatura");
        return;
      }

      if (!response.ok) {
        alert(data.error || "Erro ao criar assinatura");
        return;
      }

      // Redirecionar para o checkout do Mercado Pago
      window.location.href = data.init_point;
    } catch {
      alert("Erro ao processar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gold text-black text-base font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Processando...
        </>
      ) : (
        <>
          Assinar Agora
          <ArrowRight className="w-5 h-5" />
        </>
      )}
    </button>
  );
}
