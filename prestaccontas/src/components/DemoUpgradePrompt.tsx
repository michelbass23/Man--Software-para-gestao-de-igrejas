"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, X, Loader2 } from "lucide-react";
import { exitDemoToSignup } from "@/app/login/demo-actions";

const PROMPT_DELAY_MS = 3 * 60 * 1000;

export default function DemoUpgradePrompt({ isDemo }: { isDemo: boolean }) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleSubscribe = async () => {
    setIsExiting(true);
    await exitDemoToSignup();
    router.push("/login?mode=signup");
  };

  useEffect(() => {
    if (!isDemo) return;

    const timer = setTimeout(() => setShow(true), PROMPT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isDemo]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-card max-w-md w-full p-6 md:p-8 rounded-2xl border-gold/30 relative">
        <button
          onClick={() => setShow(false)}
          className="absolute top-4 right-4 text-subtle hover:text-strong transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-xl bg-gold-dim flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6 text-gold" />
        </div>

        <h2 className="text-xl font-semibold text-strong mb-2">
          Gostou do que viu?
        </h2>
        <p className="text-muted text-sm mb-6">
          Isso é só uma demonstração com dados fictícios. Crie sua conta agora
          e comece a organizar as finanças da sua igreja de verdade.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSubscribe}
            disabled={isExiting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gold text-black text-sm font-semibold hover:bg-gold/90 transition-all disabled:opacity-50"
          >
            {isExiting && <Loader2 className="w-4 h-4 animate-spin" />}
            Assinar agora
          </button>
          <button
            onClick={() => setShow(false)}
            disabled={isExiting}
            className="flex-1 px-4 py-3 rounded-xl border border-border text-muted text-sm font-medium hover:bg-hover transition-all disabled:opacity-50"
          >
            Continuar explorando
          </button>
        </div>
      </div>
    </div>
  );
}
