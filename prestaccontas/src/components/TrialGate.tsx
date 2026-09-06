"use client";

import { useEffect, useState } from "react";
import { Lock, Sparkles, Loader2, LogOut } from "lucide-react";
import { signOut } from "@/app/login/actions";

interface TrialGateProps {
  /** Momento em que o teste grátis termina (ISO). */
  trialEndsAt: string;
  /** Já bloqueado no servidor (teste expirado ao carregar a página). */
  expired: boolean;
}

const FEATURES = [
  "Controle financeiro completo e ilimitado",
  "Gestão de membros e eventos",
  "Relatórios detalhados em PDF",
  "Equipe com múltiplos usuários",
  "Suporte prioritário",
];

export default function TrialGate({ trialEndsAt, expired }: TrialGateProps) {
  const [locked, setLocked] = useState(expired);
  const [redirecting, setRedirecting] = useState(false);

  // Se ainda está no teste, agenda o bloqueio para quando o tempo acabar,
  // sem precisar recarregar a página.
  useEffect(() => {
    if (locked) return;

    const remaining = new Date(trialEndsAt).getTime() - Date.now();
    const timer = setTimeout(() => setLocked(true), Math.max(remaining, 0));
    return () => clearTimeout(timer);
  }, [trialEndsAt, locked]);

  useEffect(() => {
    if (locked) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [locked]);

  if (!locked) return null;

  const goToCheckout = () => {
    setRedirecting(true);
    window.location.href = "/assinatura";
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <div className="glass-card w-full max-w-md rounded-2xl p-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold/15">
          <Lock className="h-8 w-8 text-gold" />
        </div>

        <h2 className="mb-2 text-2xl font-bold text-zinc-100">
          Seu teste grátis terminou
        </h2>
        <p className="mb-6 text-sm text-zinc-400">
          Assine agora para desbloquear o sistema e continuar de onde parou.
          Seus dados estão salvos e voltam assim que o pagamento for confirmado.
        </p>

        <ul className="mb-8 space-y-2 text-left">
          {FEATURES.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-2 text-sm text-zinc-300"
            >
              <Sparkles className="h-4 w-4 flex-shrink-0 text-gold" />
              {feature}
            </li>
          ))}
        </ul>

        <button
          onClick={goToCheckout}
          disabled={redirecting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3.5 text-sm font-semibold text-black transition-all hover:bg-gold/90 disabled:opacity-50"
        >
          {redirecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Assinar agora
        </button>

        <form action={signOut}>
          <button
            type="submit"
            className="mt-3 flex w-full items-center justify-center gap-2 py-2 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
          >
            <LogOut className="h-4 w-4" />
            Sair da conta
          </button>
        </form>
      </div>
    </div>
  );
}
