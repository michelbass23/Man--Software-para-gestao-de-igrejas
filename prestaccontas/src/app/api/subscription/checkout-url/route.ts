import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AsaasError, getSubscriptionCheckoutUrl } from "@/lib/asaas";

// Retorna o link de pagamento da fatura em aberto da assinatura já existente
// do tenant (usado na tela de bloqueio por inadimplência, para não criar
// uma segunda assinatura na Asaas).
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id, tenants(asaas_subscription_id)")
      .eq("id", user.id)
      .single();

    const subscriptionId = (
      profile?.tenants as { asaas_subscription_id?: string } | null
    )?.asaas_subscription_id;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Nenhuma assinatura encontrada" },
        { status: 404 }
      );
    }

    const checkoutUrl = await getSubscriptionCheckoutUrl(subscriptionId);
    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error("Erro ao buscar link de pagamento:", error);
    const status = error instanceof AsaasError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status });
  }
}
