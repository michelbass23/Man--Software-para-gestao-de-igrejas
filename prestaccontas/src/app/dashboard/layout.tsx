import DashboardShell from "@/components/DashboardShell";
import { createClient } from "@/lib/supabase/server";
import { resolveTenantAccess } from "@/lib/subscription";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Buscar profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role, tenant_id")
    .eq("id", user.id)
    .single();

  // Se não tem profile, redirecionar para setup
  if (!profile) {
    redirect("/setup");
  }

  const isDemo = user.email === "demo@prestaccontas.com";

  // Buscar nome, logo, plano e status de assinatura do tenant
  let tenantName = "Igreja";
  let tenantLogoUrl: string | null = null;
  let tenantPlan = "free";
  let subscriptionOverdueSince: string | null = null;
  let trialEndsAt: string | null = null;
  let trialExpired = false;

  if (profile.tenant_id) {
    const { data: tenant } = await supabase
      .from("tenants")
      .select(
        "name, logo_url, plan, status, created_at, subscription_started_at, subscription_overdue_since"
      )
      .eq("id", profile.tenant_id)
      .single();

    if (tenant) {
      tenantName = tenant.name;
      tenantLogoUrl = tenant.logo_url;
      tenantPlan = tenant.plan || "free";

      const access = resolveTenantAccess(tenant);

      // Acesso suspenso (carência esgotada): bloqueia o acesso ao painel.
      if (access.state === "blocked" && !isDemo) {
        redirect("/assinatura/bloqueado");
      }

      if (access.state === "overdue") {
        subscriptionOverdueSince = tenant.subscription_overdue_since;
      }

      // Só entrega as infos do teste quando ele é relevante (usuário sem
      // assinatura ativa). Assinante pagante nunca vê o TrialGate.
      if (access.state === "trial" || access.state === "trial_expired") {
        trialEndsAt = access.trialEndsAt;
        trialExpired = access.state === "trial_expired";
      }
    }
  }

  const userName = profile.name || user.email?.split("@")[0] || "Usuário";
  const userRole = profile.role || "admin";

  return (
    <DashboardShell
      tenantName={tenantName}
      tenantLogoUrl={tenantLogoUrl}
      userName={userName}
      userRole={userRole}
      tenantPlan={tenantPlan}
      isDemo={isDemo}
      subscriptionOverdueSince={subscriptionOverdueSince}
      trialEndsAt={trialEndsAt}
      trialExpired={trialExpired}
    >
      {children}
    </DashboardShell>
  );
}
