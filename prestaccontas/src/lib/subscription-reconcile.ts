import { createAdminClient } from "@/lib/supabase/server";
import { getLatestPayment } from "@/lib/asaas";
import { resolveTenantAccess, type TenantAccess } from "@/lib/subscription";

const PAID_STATUSES = ["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"];

interface ReconcilableTenant {
  plan?: string | null;
  status?: string | null;
  created_at: string;
  subscription_started_at?: string | null;
  asaas_subscription_id?: string | null;
}

// Reconciliação sob demanda com a Asaas: se o tenant ainda não está ativo mas a
// última fatura da assinatura já consta paga, libera o acesso na hora — cobre o
// caso do webhook PAYMENT_CONFIRMED atrasar ou se perder. Retorna o acesso já
// atualizado (ou o original, se não havia o que reconciliar).
export async function reconcileTenantAccess(
  tenantId: string,
  tenant: ReconcilableTenant
): Promise<TenantAccess> {
  const access = resolveTenantAccess(tenant);

  if (access.state === "active" || !tenant.asaas_subscription_id) {
    return access;
  }

  try {
    const payment = await getLatestPayment(tenant.asaas_subscription_id);
    if (!payment || !PAID_STATUSES.includes(payment.status)) {
      return access;
    }

    const admin = createAdminClient();
    const updateData: Record<string, unknown> = {
      status: "active",
      plan: "pro",
      subscription_next_payment: payment.dueDate,
      subscription_overdue_since: null,
      updated_at: new Date().toISOString(),
    };
    if (!tenant.subscription_started_at) {
      updateData.subscription_started_at = new Date().toISOString();
    }

    await admin.from("tenants").update(updateData).eq("id", tenantId);

    return resolveTenantAccess({ ...tenant, status: "active", plan: "pro" });
  } catch (error) {
    // Falha ao consultar a Asaas não deve quebrar o fluxo; o webhook e o cron
    // diário continuam como caminhos de fallback.
    console.error("Erro ao reconciliar assinatura com a Asaas:", error);
    return access;
  }
}
