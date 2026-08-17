import Link from "next/link";
import { Clock } from "lucide-react";

export default function SubscriptionPendingPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="glass-card p-8 md:p-12 rounded-2xl max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-100 mb-3">
          Pagamento Pendente
        </h1>
        <p className="text-zinc-400 mb-8">
          Seu pagamento está sendo processado. Você receberá uma confirmação em
          breve. Isso pode levar alguns minutos.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gold text-black text-sm font-semibold hover:bg-gold/90 transition-colors"
        >
          Voltar ao Início
        </Link>
      </div>
    </div>
  );
}
