import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reconcileTenantAccess } from "@/lib/subscription-reconcile";

// Usado pela tela de sucesso para saber se o pagamento já foi confirmado antes
// de mandar o usuário de volta ao dashboard. Reconcilia direto com a Asaas: se
// o webhook PAYMENT_CONFIRMED ainda não chegou mas a fatura já consta paga,
// libera o acesso na hora.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "tenant_id, tenants(plan, status, created_at, subscription_started_at, asaas_subscription_id)"
    )
    .eq("id", user.id)
    .single();

  const rawTenant = profile?.tenants as unknown;
  const tenant = (Array.isArray(rawTenant) ? rawTenant[0] : rawTenant) as
    | {
        plan?: string | null;
        status?: string | null;
        created_at: string;
        subscription_started_at?: string | null;
        asaas_subscription_id?: string | null;
      }
    | null
    | undefined;

  if (!tenant || !profile?.tenant_id) {
    return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });
  }

  const access = await reconcileTenantAccess(profile.tenant_id, tenant);

  return NextResponse.json({
    active: access.state === "active",
    state: access.state,
    plan: access.state === "active" ? "pro" : tenant.plan ?? "free",
  });
}
