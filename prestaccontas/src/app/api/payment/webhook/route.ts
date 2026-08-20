import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MERCADO_PAGO_API = "https://api.mercadopago.com";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.type === "payment") {
      const paymentId = body.data?.id;

      if (!paymentId) {
        return NextResponse.json({ received: true });
      }

      const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
      if (!accessToken) {
        return NextResponse.json({ received: true });
      }

      const mpResponse = await fetch(
        `${MERCADO_PAGO_API}/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!mpResponse.ok) {
        return NextResponse.json({ received: true });
      }

      const payment = await mpResponse.json();

      if (payment.status !== "approved") {
        return NextResponse.json({ received: true });
      }

      // external_reference = "tenant_id:months"
      const [tenantId, monthsStr] = (payment.external_reference || "").split(":");
      const months = parseInt(monthsStr) || 1;

      if (!tenantId) {
        return NextResponse.json({ received: true });
      }

      const supabase = await createClient();

      const nextPayment = new Date();
      nextPayment.setMonth(nextPayment.getMonth() + months);

      // Determinar plano baseado na duração (valores compatíveis com CHECK constraint)
      const planType = months >= 12 ? "pro" : "pro";

      await supabase
        .from("tenants")
        .update({
          status: "active",
          plan: planType,
          subscription_started_at: new Date().toISOString(),
          subscription_next_payment: nextPayment.toISOString().split("T")[0],
          updated_at: new Date().toISOString(),
        })
        .eq("id", tenantId);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro no webhook de pagamento:", error);
    return NextResponse.json({ received: true });
  }
}
