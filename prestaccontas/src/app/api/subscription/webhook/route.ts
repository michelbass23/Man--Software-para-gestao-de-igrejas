import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/asaas";

const CONFIRMED_EVENTS = ["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"];

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

    if (webhookToken && receivedToken !== webhookToken) {
      await logWebhookEvent({ status: "error", errorMessage: "Token inválido" });
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    body = await request.json();
    const subscriptionId = body.payment?.subscription;

    if (!CONFIRMED_EVENTS.includes(body.event ?? "")) {
      await logWebhookEvent({
        event: body.event,
        subscriptionId,
        status: "ignored",
        payload: body,
      });
      return NextResponse.json({ received: true });
    }

    if (!subscriptionId) {
      await logWebhookEvent({
        event: body.event,
        status: "ignored",
        errorMessage: "Sem subscription no payload",
        payload: body,
      });
      return NextResponse.json({ received: true });
    }

    const admin = createAdminClient();

    const { data: tenant } = await admin
      .from("tenants")
      .select("id, subscription_started_at")
      .eq("asaas_subscription_id", subscriptionId)
      .single();

    if (!tenant) {
      await logWebhookEvent({
        event: body.event,
        subscriptionId,
        status: "error",
        errorMessage: "Tenant não encontrado para essa subscription",
        payload: body,
      });
      return NextResponse.json({ received: true });
    }

    const subscription = await getSubscription(subscriptionId);

    const updateData: Record<string, unknown> = {
      status: "active",
      plan: "pro",
      subscription_next_payment: subscription.nextDueDate,
      updated_at: new Date().toISOString(),
    };

    if (!tenant.subscription_started_at) {
      updateData.subscription_started_at = new Date().toISOString();
    }

    await admin.from("tenants").update(updateData).eq("id", tenant.id);

    await logWebhookEvent({
      event: body.event,
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
