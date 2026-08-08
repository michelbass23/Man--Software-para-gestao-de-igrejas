import DashboardShell from "@/components/DashboardShell";
import { createClient } from "@/lib/supabase/server";
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

  // Buscar nome e logo do tenant
  let tenantName = "Igreja";
  let tenantLogoUrl: string | null = null;
  if (profile.tenant_id) {
    const { data: tenant } = await supabase
      .from("tenants")
      .select("name, logo_url")
      .eq("id", profile.tenant_id)
      .single();
    if (tenant) {
      tenantName = tenant.name;
      tenantLogoUrl = tenant.logo_url;
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
    >
      {children}
    </DashboardShell>
  );
}
