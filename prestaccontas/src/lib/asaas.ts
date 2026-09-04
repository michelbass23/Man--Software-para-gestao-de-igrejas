const ASAAS_API_URL =
  process.env.ASAAS_ENV === "production"
    ? "https://api.asaas.com/v3"
    : "https://api-sandbox.asaas.com/v3";

type AsaasPlan = "monthly" | "annual";

const PLAN_CONFIG: Record<AsaasPlan, { cycle: "MONTHLY" | "YEARLY"; value: number; description: string }> = {
  monthly: {
    cycle: "MONTHLY",
    value: 147.0,
    description: "Maná Sistemas - Plano Mensal",
  },
  annual: {
    cycle: "YEARLY",
    value: 1470.0,
    description: "Maná Sistemas - Plano Anual",
  },
};

class AsaasError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "AsaasError";
  }
}

async function asaasFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const accessToken = process.env.ASAAS_API_KEY;
  if (!accessToken) {
    throw new AsaasError("ASAAS_API_KEY não configurada", 500);
  }

  const response = await fetch(`${ASAAS_API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      access_token: accessToken,
      ...init?.headers,
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const message =
      data?.errors?.map((e: { description: string }) => e.description).join("; ") ||
      `Asaas erro (${response.status})`;
    throw new AsaasError(message, response.status);
  }

  return data as T;
}

interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
}

export async function findOrCreateCustomer(params: {
  tenantId: string;
  name: string;
  email: string;
  cpfCnpj: string;
  phone?: string;
}): Promise<AsaasCustomer> {
  const existing = await asaasFetch<{ data: AsaasCustomer[] }>(
    `/customers?externalReference=${encodeURIComponent(params.tenantId)}`
  );

  if (existing.data?.length > 0) {
    return existing.data[0];
  }

  return asaasFetch<AsaasCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify({
      name: params.name,
      email: params.email,
      cpfCnpj: params.cpfCnpj.replace(/\D/g, ""),
      mobilePhone: params.phone?.replace(/\D/g, "") || undefined,
      externalReference: params.tenantId,
    }),
  });
}

interface AsaasSubscription {
  id: string;
  status: string;
  nextDueDate: string;
}

export async function createSubscription(params: {
  customerId: string;
  tenantId: string;
  plan: AsaasPlan;
}): Promise<AsaasSubscription> {
  const config = PLAN_CONFIG[params.plan];
  const nextDueDate = new Date().toISOString().split("T")[0];

  return asaasFetch<AsaasSubscription>("/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      customer: params.customerId,
      billingType: "UNDEFINED",
      cycle: config.cycle,
      value: config.value,
      nextDueDate,
      description: config.description,
      externalReference: params.tenantId,
    }),
  });
}

export async function getSubscription(subscriptionId: string): Promise<AsaasSubscription> {
  return asaasFetch<AsaasSubscription>(`/subscriptions/${subscriptionId}`);
}

export async function getSubscriptionCheckoutUrl(subscriptionId: string): Promise<string> {
  const payments = await asaasFetch<{ data: { invoiceUrl: string }[] }>(
    `/payments?subscription=${subscriptionId}&limit=1`
  );

  const invoiceUrl = payments.data?.[0]?.invoiceUrl;
  if (!invoiceUrl) {
    throw new AsaasError("Não foi possível gerar o link de pagamento", 500);
  }

  return invoiceUrl;
}

export { AsaasError };
export type { AsaasPlan };
