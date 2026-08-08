"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getTenantId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autenticado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id, role")
    .eq("id", user.id)
    .single();

  if (!profile) throw new Error("Perfil não encontrado");
  if (profile.role !== "admin") throw new Error("Apenas administradores podem alterar configurações");

  return profile.tenant_id;
}

export async function getTenantSettings() {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("id, name, logo_url")
    .eq("id", tenantId)
    .single();

  if (error) {
    console.error("Erro ao buscar configurações:", error);
    return null;
  }

  return tenant;
}

export async function updateTenantLogo(logoUrl: string | null) {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const { error } = await supabase
    .from("tenants")
    .update({ logo_url: logoUrl })
    .eq("id", tenantId);

  if (error) {
    console.error("Erro ao atualizar logo:", error);
    return { error: "Erro ao atualizar logo" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  return { error: null };
}

export async function uploadLogo(file: File) {
  const supabase = await createClient();
  const tenantId = await getTenantId();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Não autenticado", url: null };

  // Validar tipo
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Tipo não permitido. Use: JPG, PNG, WEBP ou SVG", url: null };
  }

  // Validar tamanho (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { error: "Arquivo muito grande. Máximo: 5MB", url: null };
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `logos/${tenantId}-${Date.now()}.${fileExt}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  // Upload para o storage
  const { error: uploadError } = await supabase.storage
    .from("receipts")
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    console.error("Erro no upload da logo:", uploadError);
    return { error: "Erro ao fazer upload da logo", url: null };
  }

  const { data: urlData } = supabase.storage
    .from("receipts")
    .getPublicUrl(fileName);

  // Atualizar o tenant com a nova logo
  const { error: updateError } = await supabase
    .from("tenants")
    .update({ logo_url: urlData.publicUrl })
    .eq("id", tenantId);

  if (updateError) {
    console.error("Erro ao salvar logo:", updateError);
    return { error: "Erro ao salvar logo", url: null };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");

  return { error: null, url: urlData.publicUrl };
}

export async function removeLogo() {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const { error } = await supabase
    .from("tenants")
    .update({ logo_url: null })
    .eq("id", tenantId);

  if (error) {
    console.error("Erro ao remover logo:", error);
    return { error: "Erro ao remover logo" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  return { error: null };
}
