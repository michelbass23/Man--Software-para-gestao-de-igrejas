import Link from "next/link";
import { XCircle } from "lucide-react";

export default function SubscriptionFailurePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="glass-card p-8 md:p-12 rounded-2xl max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-ruby/10 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8 text-ruby" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-100 mb-3">
          Pagamento Não Realizado
        </h1>
        <p className="text-zinc-400 mb-8">
          Houve um problema com seu pagamento. Você pode tentar novamente a
          qualquer momento.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/#pricing"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gold text-black text-sm font-semibold hover:bg-gold/90 transition-colors"
          >
            Tentar Novamente
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl border border-border text-zinc-300 text-sm font-medium hover:bg-white/5 transition-colors"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
}
