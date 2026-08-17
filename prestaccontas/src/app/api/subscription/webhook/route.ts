import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MERCADO_PAGO_API = "https://api.mercadopago.com";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Mercado Pago envia notificações de diferentes tipos
    // Para preapprovals (assinaturas), o type é "preapproval"
    if (body.type === "preapproval") {
      const preapprovalId = body.data?.id;

      if (!preapprovalId) {
        return NextResponse.json({ received: true });
      }

      const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
      if (!accessToken) {
        return NextResponse.json({ received: true });
      }

      // Buscar detalhes da assinatura no Mercado Pago
      const mpResponse = await fetch(
        `${MERCADO_PAGO_API}/preapproval/${preapprovalId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!mpResponse.ok) {
        return NextResponse.json({ received: true });
      }

      const preapproval = await mpResponse.json();
      const tenantId = preapproval.external_reference;

      if (!tenantId) {
        return NextResponse.json({ received: true });
      }

      const supabase = await createClient();

      // Mapear status do Mercado Pago para nosso sistema
      let tenantStatus = "inactive";
      let tenantPlan = "free";

      if (preapproval.status === "authorized") {
        tenantStatus = "active";
        tenantPlan = "pro";
      } else if (preapproval.status === "pending") {
        tenantStatus = "trialing";
        tenantPlan = "free";
      }

      // Atualizar o tenant no Supabase
      const updateData: Record<string, unknown> = {
        status: tenantStatus,
        plan: tenantPlan,
        mercado_pago_preapproval_id: preapprovalId,
        updated_at: new Date().toISOString(),
      };

      if (preapproval.status === "authorized") {
        updateData.subscription_started_at = new Date().toISOString();
        // Próximo pagamento: 1 mês a partir de agora
        const nextPayment = new Date();
        nextPayment.setMonth(nextPayment.getMonth() + 1);
        updateData.subscription_next_payment = nextPayment
          .toISOString()
          .split("T")[0];
      }

      await supabase.from("tenants").update(updateData).eq("id", tenantId);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro no webhook:", error);
    return NextResponse.json({ received: true });
  }
}
