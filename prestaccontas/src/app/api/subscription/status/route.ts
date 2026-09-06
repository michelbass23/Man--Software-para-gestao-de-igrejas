import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveTenantAccess } from "@/lib/subscription";

// Usado pela tela de sucesso para saber se o webhook da Asaas já confirmou
// o pagamento antes de mandar o usuário de volta ao dashboard.
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
    .select("tenant_id, tenants(plan, status, created_at, subscription_started_at)")
    .eq("id", user.id)
    .single();

  const rawTenant = profile?.tenants as unknown;
  const tenant = (Array.isArray(rawTenant) ? rawTenant[0] : rawTenant) as
    | {
        plan?: string | null;
        status?: string | null;
        created_at: string;
        subscription_started_at?: string | null;
      }
    | null
    | undefined;

  if (!tenant) {
    return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });
  }

  const access = resolveTenantAccess(tenant);

  return NextResponse.json({
    active: access.state === "active",
    state: access.state,
    plan: tenant.plan ?? "free",
  });
}
