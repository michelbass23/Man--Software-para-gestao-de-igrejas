import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function SubscriptionSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="glass-card p-8 md:p-12 rounded-2xl max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-100 mb-3">
          Assinatura Confirmada!
        </h1>
        <p className="text-zinc-400 mb-8">
          Seu pagamento foi processado com sucesso. Agora você tem acesso
          completo ao Maná Sistemas.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gold text-black text-sm font-semibold hover:bg-gold/90 transition-colors"
        >
          Acessar Dashboard
        </Link>
      </div>
    </div>
  );
}
