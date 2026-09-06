import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getLatestPayment } from "@/lib/asaas";

// Dias de carência após a fatura vencer antes de bloquear o acesso do tenant.
const GRACE_PERIOD_DAYS = 5;

// Reconciliação diária: cobre o caso de um webhook da Asaas não ter chegado
// (rede instável, deploy no meio do envio, etc). Sem isso, um tenant que
// pagou mas cujo PAYMENT_CONFIRMED se perdeu ficaria bloqueado indevidamente,
// e um tenant que não pagou e cujo PAYMENT_OVERDUE se perdeu nunca seria
// bloqueado.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: tenants, error } = await admin
    .from("tenants")
    .select("id, asaas_subscription_id, status, subscription_overdue_since")
    .eq("status", "overdue")
    .not("asaas_subscription_id", "is", null);

  if (error) {
    console.error("Erro ao buscar tenants em atraso:", error);
    return NextResponse.json({ error: "Erro ao buscar tenants" }, { status: 500 });
  }

  const results = {
    checked: tenants?.length || 0,
    reactivated: 0,
    blocked: 0,
    stillInGrace: 0,
    errors: 0,
  };

  for (const tenant of tenants || []) {
    try {
      const payment = await getLatestPayment(tenant.asaas_subscription_id!);

      if (payment && ["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"].includes(payment.status)) {
        await admin
          .from("tenants")
          .update({
            status: "active",
            subscription_overdue_since: null,
            subscription_next_payment: payment.dueDate,
            updated_at: new Date().toISOString(),
          })
          .eq("id", tenant.id);
        results.reactivated++;
        continue;
      }

      const overdueSince = tenant.subscription_overdue_since
        ? new Date(tenant.subscription_overdue_since)
        : new Date();
      const daysOverdue = (Date.now() - overdueSince.getTime()) / (1000 * 60 * 60 * 24);

      if (daysOverdue >= GRACE_PERIOD_DAYS) {
        await admin
          .from("tenants")
          .update({ status: "inactive", updated_at: new Date().toISOString() })
          .eq("id", tenant.id);
        results.blocked++;
      } else {
        results.stillInGrace++;
      }
    } catch (err) {
      console.error(`Erro ao verificar tenant ${tenant.id}:`, err);
      results.errors++;
    }
  }

  return NextResponse.json({ ok: true, ...results });
}
