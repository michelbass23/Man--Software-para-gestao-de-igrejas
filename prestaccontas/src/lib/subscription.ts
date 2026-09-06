// Regras de acesso: período de teste grátis e assinatura paga.
//
// Para mudar a duração do teste, altere apenas esta constante.
// Ex.: 7 dias -> 7 * 24 * 60 * 60 * 1000
export const TRIAL_DURATION_MS = 5 * 60 * 1000; // 5 minutos de teste grátis

export type AccessState =
  | "active" // assinatura paga em dia
  | "trial" // dentro do período de teste grátis
  | "trial_expired" // teste acabou e nunca assinou -> travar
  | "overdue" // assinatura vencida, ainda na carência
  | "blocked"; // acesso suspenso (carência esgotada)

interface TenantAccessInput {
  plan?: string | null;
  status?: string | null;
  created_at: string;
  subscription_started_at?: string | null;
}

export interface TenantAccess {
  state: AccessState;
  /** Momento em que o teste grátis termina (ISO). */
  trialEndsAt: string;
  /** true quando o usuário precisa assinar para continuar usando. */
  requiresSubscription: boolean;
}

function isPaidPlan(plan?: string | null) {
  return plan === "pro" || plan === "enterprise";
}

export function resolveTenantAccess(tenant: TenantAccessInput): TenantAccess {
  const trialEndsAt = new Date(
    new Date(tenant.created_at).getTime() + TRIAL_DURATION_MS
  ).toISOString();

  // Acesso suspenso pela reconciliação de inadimplência.
  if (tenant.status === "inactive") {
    return { state: "blocked", trialEndsAt, requiresSubscription: true };
  }

  // Assinatura paga e em dia.
  if (isPaidPlan(tenant.plan) && tenant.status === "active") {
    return { state: "active", trialEndsAt, requiresSubscription: false };
  }

  // Assinatura vencida (dentro da carência) — o OverdueBanner cuida do aviso.
  if (tenant.status === "overdue") {
    return { state: "overdue", trialEndsAt, requiresSubscription: false };
  }

  // Plano free / sem assinatura ativa: depende do período de teste.
  const trialExpired = Date.now() >= new Date(trialEndsAt).getTime();
  return {
    state: trialExpired ? "trial_expired" : "trial",
    trialEndsAt,
    requiresSubscription: trialExpired,
  };
}
