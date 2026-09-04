import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  AsaasError,
  createSubscription,
  findOrCreateCustomer,
  getSubscriptionCheckoutUrl,
  type AsaasPlan,
} from "@/lib/asaas";

export async function POST(request: NextRequest) {
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
      .select("tenant_id, name, tenants(*)")
      .eq("id", user.id)
      .single();

    if (!profile?.tenants) {
      return NextResponse.json(
        { error: "Tenant não encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const plan: AsaasPlan = body.plan === "annual" ? "annual" : "monthly";
    const cpfCnpj: string = (body.cpfCnpj || "").replace(/\D/g, "");
    const phone: string | undefined = body.phone;

    if (cpfCnpj.length !== 11 && cpfCnpj.length !== 14) {
      return NextResponse.json(
        { error: "CPF ou CNPJ inválido" },
        { status: 400 }
      );
    }

    const customer = await findOrCreateCustomer({
      tenantId: profile.tenant_id,
      name: (profile.name as string) || user.email || "Cliente",
      email: user.email!,
      cpfCnpj,
      phone,
    });

    const subscription = await createSubscription({
      customerId: customer.id,
      tenantId: profile.tenant_id,
      plan,
    });

    const checkoutUrl = await getSubscriptionCheckoutUrl(subscription.id);

    await supabase
      .from("tenants")
      .update({
        asaas_customer_id: customer.id,
        asaas_subscription_id: subscription.id,
        cpf_cnpj: cpfCnpj,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.tenant_id);

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error("Erro ao criar assinatura:", error);
    const status = error instanceof AsaasError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status });
  }
}
