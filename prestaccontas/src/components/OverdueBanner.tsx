"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

const GRACE_PERIOD_DAYS = 5;

export default function OverdueBanner({
  overdueSince,
}: {
  overdueSince: string | null;
}) {
  const [dismissed, setDismissed] = useState(false);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!overdueSince) {
      setDaysLeft(null);
      return;
    }

    const daysElapsed = Math.floor(
      (Date.now() - new Date(overdueSince).getTime()) / (1000 * 60 * 60 * 24)
    );
    setDaysLeft(Math.max(GRACE_PERIOD_DAYS - daysElapsed, 0));
  }, [overdueSince]);

  if (!overdueSince || dismissed || daysLeft === null) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3">
      <div className="flex items-center justify-between gap-3 flex-wrap max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-amber-400 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            Sua fatura está vencida. Regularize em até{" "}
            <strong>{daysLeft} dia{daysLeft === 1 ? "" : "s"}</strong> para não
            perder o acesso ao sistema.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/assinatura/bloqueado"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline"
          >
            Regularizar agora
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="text-xs text-amber-400/60 hover:text-amber-400"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
