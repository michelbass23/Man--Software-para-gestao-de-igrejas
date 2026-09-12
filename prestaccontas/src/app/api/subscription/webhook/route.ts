import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/asaas";

const CONFIRMED_EVENTS = ["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"];
const OVERDUE_EVENTS = ["PAYMENT_OVERDUE"];

async function logWebhookEvent(params: {
  event?: string;
  subscriptionId?: string;
  tenantId?: string;
  status: "processed" | "ignored" | "error";
  errorMessage?: string;
  payload?: unknown;
}) {
  try {
    const admin = createAdminClient();
    await admin.from("webhook_logs").insert({
      provider: "asaas",
      event: params.event,
      subscription_id: params.subscriptionId,
      tenant_id: params.tenantId,
      status: params.status,
      error_message: params.errorMessage,
      payload: params.payload,
    });
  } catch (logError) {
    // Se nem o log funcionar (ex: migration não aplicada), não deve derrubar o webhook
    console.error("Erro ao gravar log do webhook:", logError);
  }
}

export async function POST(request: NextRequest) {
  let body: { event?: string; payment?: { subscription?: string } } = {};

  try {
    const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN;
    const receivedToken = request.headers.get("asaas-access-token");

    // Falha fechado: sem token configurado, o webhook não aceita nenhuma
    // requisição (antes, a ausência da env var liberava tudo sem checagem).
    if (!webhookToken || receivedToken !== webhookToken) {
      await logWebhookEvent({ status: "error", errorMessage: "Token inválido" });
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    body = await request.json();
    const subscriptionId = body.payment?.subscription;
    const event = body.event ?? "";

    if (!CONFIRMED_EVENTS.includes(event) && !OVERDUE_EVENTS.includes(event)) {
      await logWebhookEvent({ event, subscriptionId, status: "ignored", payload: body });
      return NextResponse.json({ received: true });
    }

    if (!subscriptionId) {
      await logWebhookEvent({
        event,
        status: "ignored",
        errorMessage: "Sem subscription no payload",
        payload: body,
      });
      return NextResponse.json({ received: true });
    }

    const admin = createAdminClient();

    const { data: tenant } = await admin
      .from("tenants")
      .select("id, status, subscription_started_at")
      .eq("asaas_subscription_id", subscriptionId)
      .single();

    if (!tenant) {
      await logWebhookEvent({
        event,
        subscriptionId,
        status: "error",
        errorMessage: "Tenant não encontrado para essa subscription",
        payload: body,
      });
      return NextResponse.json({ received: true });
    }

    if (CONFIRMED_EVENTS.includes(event)) {
      const subscription = await getSubscription(subscriptionId);

      const updateData: Record<string, unknown> = {
        status: "active",
        plan: "pro",
        subscription_next_payment: subscription.nextDueDate,
        subscription_overdue_since: null,
        updated_at: new Date().toISOString(),
      };

      if (!tenant.subscription_started_at) {
        updateData.subscription_started_at = new Date().toISOString();
      }

      await admin.from("tenants").update(updateData).eq("id", tenant.id);
    } else if (OVERDUE_EVENTS.includes(event)) {
      // Só marca o início da carência na primeira vez que entra em atraso;
      // eventos repetidos (ex: outra fatura vencendo) não devem resetar o prazo.
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (tenant.status !== "overdue" && tenant.status !== "inactive") {
        updateData.status = "overdue";
        updateData.subscription_overdue_since = new Date().toISOString();
      }

      await admin.from("tenants").update(updateData).eq("id", tenant.id);
    }

    await logWebhookEvent({
      event,
      subscriptionId,
      tenantId: tenant.id,
      status: "processed",
      payload: body,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro no webhook Asaas:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    await logWebhookEvent({
      event: body.event,
      subscriptionId: body.payment?.subscription,
      status: "error",
      errorMessage,
      payload: body,
    });
    return NextResponse.json({ received: true });
  }
}
