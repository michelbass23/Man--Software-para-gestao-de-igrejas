"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SubscriptionSuccessPage() {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = "/dashboard";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="glass-card p-8 md:p-12 rounded-2xl max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-100 mb-3">
          Assinatura Confirmada!
        </h1>
        <p className="text-zinc-400 mb-2">
          Seu pagamento foi processado com sucesso.
        </p>
        <p className="text-zinc-500 text-sm mb-8">
          Redirecionando para o dashboard em {countdown} segundos...
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gold text-black text-sm font-semibold hover:bg-gold/90 transition-colors"
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          Acessar Dashboard
        </Link>
      </div>
    </div>
  );
}
