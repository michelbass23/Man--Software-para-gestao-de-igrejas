"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function setupTenant(
  prevState: string | null,
  formData: FormData
) {
  const churchName = formData.get("churchName") as string;

  if (!churchName) {
    return "Preencha o nome da igreja";
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return "Não autenticado";
  }

  // Verificar se já tem profile
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (existingProfile) {
    redirect("/dashboard");
  }

  // Usar admin client para criar tenant e profile (bypass RLS)
  const admin = createAdminClient();

  // Criar tenant
  const slug = churchName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const { data: tenant, error: tenantError } = await admin
    .from("tenants")
    .insert({
      name: churchName,
      slug: `${slug}-${Date.now().toString(36)}`,
    })
    .select()
    .single();

  if (tenantError) {
    console.error("Erro ao criar tenant:", tenantError);
    return "Erro ao criar igreja. Tente novamente.";
  }

  // Criar profile
  const { error: profileError } = await admin.from("profiles").insert({
    id: user.id,
    tenant_id: tenant.id,
    name: user.email?.split("@")[0] || "Admin",
    role: "admin",
  });

  if (profileError) {
    console.error("Erro ao criar profile:", profileError);
    return "Erro ao criar perfil. Tente novamente.";
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
