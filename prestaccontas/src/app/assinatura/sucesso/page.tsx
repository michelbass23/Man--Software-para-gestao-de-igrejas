"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle, Loader2, LogOut } from "lucide-react";
import { signOut } from "@/app/login/actions";

const POLL_INTERVAL_MS = 2500;
const MAX_WAIT_MS = 45000;

export default function SubscriptionSuccessPage() {
  const [confirmed, setConfirmed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/subscription/status", { cache: "no-store" });
      const data = await res.json();
      if (data.active) {
        setConfirmed(true);
        return true;
      }
    } catch {
      // ignora e tenta de novo no próximo ciclo
    }
    return false;
  }, []);

  useEffect(() => {
    let stopped = false;
    const deadline = Date.now() + MAX_WAIT_MS;

    const tick = async () => {
      if (stopped) return;
      const done = await checkStatus();
      if (done || stopped) return;

      if (Date.now() >= deadline) {
        setTimedOut(true);
        return;
      }
      setTimeout(tick, POLL_INTERVAL_MS);
    };

    tick();
    return () => {
      stopped = true;
    };
  }, [checkStatus]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="glass-card p-8 md:p-12 rounded-2xl max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
          {confirmed ? (
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          ) : (
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          )}
        </div>

        {confirmed ? (
          <>
            <h1 className="text-2xl font-bold text-zinc-100 mb-3">
              Assinatura confirmada!
            </h1>
            <p className="text-zinc-400 mb-6">
              Pagamento aprovado! Faça login novamente para acessar o sistema
              com seu plano ativo.
            </p>
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gold text-black text-sm font-semibold hover:bg-gold/90 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Ir para o login
              </button>
            </form>
          </>
        ) : timedOut ? (
          <>
            <h1 className="text-2xl font-bold text-zinc-100 mb-3">
              Recebemos seu pagamento
            </h1>
            <p className="text-zinc-400 mb-6">
              A confirmação pode levar alguns minutos (boleto e Pix não são
              instantâneos). Faça login novamente para verificar o status.
            </p>
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gold text-black text-sm font-semibold hover:bg-gold/90 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Ir para o login
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-zinc-100 mb-3">
              Confirmando pagamento...
            </h1>
            <p className="text-zinc-400 mb-6">
              Aguarde um instante enquanto validamos a sua assinatura.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
