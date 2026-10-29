"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Lock,
  Sparkles,
  Loader2,
  LogOut,
  Clock,
  X,
  AlertTriangle,
} from "lucide-react";
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

function calcRemaining(endIso: string) {
  const diff = new Date(endIso).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, expired: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes, expired: false };
}

export default function TrialGate({ trialEndsAt, expired }: TrialGateProps) {
  const [locked, setLocked] = useState(expired);
  const [redirecting, setRedirecting] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [remaining, setRemaining] = useState(() =>
    calcRemaining(trialEndsAt)
  );

  // Atualiza a contagem regressiva a cada minuto
  useEffect(() => {
    if (locked) return;

    const tick = () => {
      const r = calcRemaining(trialEndsAt);
      setRemaining(r);
      if (r.expired) setLocked(true);
    };

    tick();
    const interval = setInterval(tick, 60_000);
    return () => clearInterval(interval);
  }, [trialEndsAt, locked]);

  // Agenda bloqueio quando o tempo acabar
  useEffect(() => {
    if (locked) return;
    const diff = new Date(trialEndsAt).getTime() - Date.now();
    const timer = setTimeout(() => setLocked(true), Math.max(diff, 0));
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

  const isUrgent = remaining.days <= 2;

  /* ─── Banner de aviso (enquanto o teste está ativo) ─── */
  if (!locked && !dismissed) {
    return (
      <div
        className={`fixed top-0 left-0 right-0 z-[90] transition-all duration-300 ${
          isUrgent
            ? "bg-gradient-to-r from-amber-900/95 via-amber-800/90 to-amber-900/95"
            : "bg-gradient-to-r from-zinc-900/95 via-zinc-800/90 to-zinc-900/95"
        } backdrop-blur-md border-b ${
          isUrgent ? "border-amber-500/30" : "border-border"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                isUrgent ? "bg-amber-500/20" : "bg-gold/15"
              }`}
            >
              {isUrgent ? (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              ) : (
                <Clock className="w-4 h-4 text-gold" />
              )}
            </div>
            <p className="text-sm text-zinc-200 truncate">
              {isUrgent ? (
                <>
                  <span className="font-semibold text-amber-300">
                    Atenção!
                  </span>{" "}
                  Restam{" "}
                  <span className="font-bold text-white">
                    {remaining.days} dia{remaining.days !== 1 && "s"}
                  </span>{" "}
                  do seu teste grátis.{" "}
                  <a
                    href="/assinatura"
                    className="underline text-amber-200 hover:text-white transition-colors"
                  >
                    Assine agora
                  </a>{" "}
                  para não perder o acesso.
                </>
              ) : (
                <>
                  Seu teste grátis termina em{" "}
                  <span className="font-bold text-white">
                    {remaining.days} dia{remaining.days !== 1 && "s"}
                  </span>
                  .{" "}
                  <a
                    href="/assinatura"
                    className="underline text-gold hover:text-gold/80 transition-colors"
                  >
                    Ver planos
                  </a>
                </>
              )}
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="flex-shrink-0 p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Fechar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  /* ─── Tela de bloqueio (teste expirado) ─── */
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

        <h2 className="mb-2 text-2xl font-bold text-strong">
          Seu teste grátis terminou
        </h2>
        <p className="mb-6 text-sm text-muted">
          Assine agora para desbloquear o sistema e continuar de onde parou.
          Seus dados estão salvos e voltam assim que o pagamento for confirmado.
        </p>

        <ul className="mb-8 space-y-2 text-left">
          {FEATURES.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-2 text-sm text-strong"
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
            <Sparkles className="h-4 h-4" />
          )}
          Assinar agora
        </button>

        <form action={signOut}>
          <button
            type="submit"
            className="mt-3 flex w-full items-center justify-center gap-2 py-2 text-sm text-subtle transition-colors hover:text-strong"
          >
            <LogOut className="h-4 w-4" />
            Sair da conta
          </button>
        </form>
      </div>
    </div>
  );
}
