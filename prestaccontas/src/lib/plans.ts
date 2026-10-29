// Definição dos planos de assinatura.
//
// Para mudar preços ou limites, altere apenas este arquivo.

export type PlanId = "starter" | "pro";

export interface PlanDefinition {
  id: PlanId;
  name: string;
  /** Limite de membros cadastrados. null = ilimitado. */
  memberLimit: number | null;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  starter: {
    id: "starter",
    name: "Essencial",
    memberLimit: 150,
    monthlyPrice: 59,
    annualPrice: 590,
    features: [
      "Até 150 membros",
      "Controle financeiro completo",
      "Eventos e agenda",
      "Check-in por QR Code",
      "Relatórios em PDF",
      "1 usuário administrador",
    ],
  },
  pro: {
    id: "pro",
    name: "Completo",
    memberLimit: null,
    monthlyPrice: 147,
    annualPrice: 1470,
    features: [
      "Membros ilimitados",
      "Controle financeiro completo",
      "Eventos ilimitados",
      "Check-in por QR Code",
      "Relatórios avançados em PDF",
      "Equipe com múltiplos usuários",
      "Convites via WhatsApp",
      "Relatório de faltosos",
      "Multi-usuário com perfis",
      "Suporte prioritário",
    ],
  },
};

/** Retorna o limite de membros do plano. null = ilimitado.
 *  'trial' não é plano — é o estado de teste derivado de created_at
 *  (ver resolveTenantAccess em subscription.ts). Durante o teste o plano
 *  é 'free', que também é ilimitado. */
export function getMemberLimit(plan: string | null | undefined): number | null {
  if (plan === "starter") return PLANS.starter.memberLimit;
  return null; // free, pro, enterprise = ilimitado
}

/** Verifica se o plano permite adicionar mais um membro. */
export function canAddMember(
  plan: string | null | undefined,
  currentCount: number
): { allowed: boolean; limit: number | null; remaining: number | null } {
  const limit = getMemberLimit(plan);
  if (limit === null) {
    return { allowed: true, limit: null, remaining: null };
  }
  return {
    allowed: currentCount < limit,
    limit,
    remaining: Math.max(0, limit - currentCount),
  };
}
