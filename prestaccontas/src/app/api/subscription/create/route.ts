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

    // Buscar o tenant do usuário
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

    // Detectar URL base automaticamente
    const origin = request.headers.get("origin") || "";
    const host = request.headers.get("host") || "localhost:3000";
    const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
    const baseUrl = origin || (isLocalhost ? `http://${host}` : `https://${host}`);

    const body = {
      reason: "Maná Sistemas - Plano Completo",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: 147.0,
        currency_id: "BRL",
      },
      back_url: `${baseUrl}/assinatura/sucesso`,
      payer_email: user.email,
      external_reference: profile.tenant_id,
      notification_url: `${baseUrl}/api/subscription/webhook`,
    };

    console.log("Criando preapproval com body:", JSON.stringify(body, null, 2));

    // Criar preapproval (assinatura recorrente) no Mercado Pago
    const preapprovalResponse = await fetch(
      `${MERCADO_PAGO_API}/preapproval`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      }
    );

    const responseText = await preapprovalResponse.text();
    console.log("Resposta MP status:", preapprovalResponse.status);
    console.log("Resposta MP body:", responseText);

    if (!preapprovalResponse.ok) {
      return NextResponse.json(
        {
          error: `Mercado Pago erro (${preapprovalResponse.status}): ${responseText}`,
        },
        { status: 500 }
      );
    }

    const preapproval = JSON.parse(responseText);

    return NextResponse.json({
      id: preapproval.id,
      init_point: preapproval.init_point,
    });
  } catch (error) {
    console.error("Erro na criação de assinatura:", error);
    return NextResponse.json(
      { error: `Erro interno: ${error}` },
      { status: 500 }
    );
  }
}
