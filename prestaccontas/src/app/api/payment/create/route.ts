import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MERCADO_PAGO_API = "https://api.mercadopago.com";

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
      .select("tenant_id, tenants(*)")
      .eq("id", user.id)
      .single();

    if (!profile?.tenants) {
      return NextResponse.json(
        { error: "Tenant não encontrado" },
        { status: 404 }
      );
    }

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { error: "Configuração de pagamento não encontrada" },
        { status: 500 }
      );
    }

    // Detectar URL base: env var > origin header > host header
    const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const origin = request.headers.get("origin") || "";
    const host = request.headers.get("host") || "localhost:3000";
    const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
    const baseUrl = envUrl || origin || (isLocalhost ? `http://${host}` : `https://${host}`);

    const { plan } = await request.json();

    const plans: Record<string, { title: string; price: number; months: number }> = {
      monthly: {
        title: "Maná Sistemas - Plano Mensal",
        price: 147.0,
        months: 1,
      },
      annual: {
        title: "Maná Sistemas - Plano Anual",
        price: 1470.0,
        months: 12,
      },
    };

    const selectedPlan = plans[plan] || plans.monthly;

    // Criar preferência de pagamento (Checkout Pro - aceita PIX, cartão, boleto)
    const body = {
      items: [
        {
          title: selectedPlan.title,
          quantity: 1,
          unit_price: selectedPlan.price,
          currency_id: "BRL",
        },
      ],
      payment_methods: {
        excluded_payment_types: [],
        installments: 12,
      },
      back_urls: {
        success: `${baseUrl}/assinatura/sucesso`,
        failure: `${baseUrl}/assinatura/erro`,
        pending: `${baseUrl}/assinatura/pendente`,
      },
      auto_return: "approved",
      external_reference: `${profile.tenant_id}:${selectedPlan.months}`,
      notification_url: `${baseUrl}/api/payment/webhook`,
      payer: {
        email: user.email,
      },
    };

    console.log("Criando pagamento:", JSON.stringify(body, null, 2));

    const response = await fetch(`${MERCADO_PAGO_API}/checkout/preferences`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();
    console.log("Resposta MP status:", response.status);
    console.log("Resposta MP body:", responseText);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Mercado Pago erro (${response.status}): ${responseText}` },
        { status: 500 }
      );
    }

    const preference = JSON.parse(responseText);

    return NextResponse.json({
      id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
    });
  } catch (error) {
    console.error("Erro ao criar pagamento:", error);
    return NextResponse.json(
      { error: `Erro interno: ${error}` },
      { status: 500 }
    );
  }
}
