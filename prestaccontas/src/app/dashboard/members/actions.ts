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
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile) throw new Error("Perfil não encontrado");

  return profile.tenant_id;
}

export async function getCurrentTenantId(): Promise<string> {
  return getTenantId();
}

export async function getMembers(filters?: {
  search?: string;
  status?: string;
  ministry?: string;
  page?: number;
  limit?: number;
}) {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("members")
    .select("*", { count: "exact" })
    .eq("tenant_id", tenantId)
    .order("name", { ascending: true });

  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
    );
  }

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.ministry) {
    query = query.eq("ministry", filters.ministry);
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    console.error("Erro ao buscar membros:", error);
    return { members: [], total: 0 };
  }

  return { members: data || [], total: count || 0 };
}

export async function getMember(id: string) {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .single();

  if (error) {
    console.error("Erro ao buscar membro:", error);
    return null;
  }

  return data;
}

export async function createMember(data: {
  name: string;
  phone?: string;
  email?: string;
  birthDate?: string;
  baptismDate?: string;
  maritalStatus?: string;
  ministry?: string;
  status?: string;
  notes?: string;
  photoUrl?: string;
}) {
  const supabase = await createClient();
  const tenantId = await getTenantId();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("members").insert({
    tenant_id: tenantId,
    name: data.name,
    phone: data.phone || null,
    email: data.email || null,
    birth_date: data.birthDate || null,
    baptism_date: data.baptismDate || null,
    marital_status: data.maritalStatus || null,
    ministry: data.ministry || null,
    status: data.status || "ativo",
    notes: data.notes || null,
    photo_url: data.photoUrl || null,
    recorded_by: user?.id || null,
  });

  if (error) {
    console.error("Erro ao criar membro:", error);
    return { error: "Erro ao salvar membro" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/members");
  return { error: null };
}

export async function updateMember(
  id: string,
  data: {
    name: string;
    phone?: string;
    email?: string;
    birthDate?: string;
    baptismDate?: string;
    maritalStatus?: string;
    ministry?: string;
    status?: string;
    notes?: string;
    photoUrl?: string;
  }
) {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const { error } = await supabase
    .from("members")
    .update({
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      birth_date: data.birthDate || null,
      baptism_date: data.baptismDate || null,
      marital_status: data.maritalStatus || null,
      ministry: data.ministry || null,
      status: data.status || "ativo",
      notes: data.notes || null,
      photo_url: data.photoUrl || null,
    })
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("Erro ao atualizar membro:", error);
    return { error: `Erro ao atualizar membro: ${error.message}` };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/members");
  return { error: null };
}

export async function deleteMember(id: string) {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const { error } = await supabase
    .from("members")
    .delete()
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("Erro ao deletar membro:", error);
    return { error: "Erro ao deletar membro" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/members");
  return { error: null };
}

export async function uploadMemberPhoto(file: File) {
  const supabase = await createClient();
  const tenantId = await getTenantId();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Não autenticado", url: null };

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Tipo não permitido. Use: JPG, PNG ou WEBP", url: null };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: "Arquivo muito grande. Máximo: 5MB", url: null };
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `photos/${tenantId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from("receipts")
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Erro no upload da foto:", uploadError);
    return { error: "Erro ao fazer upload da foto", url: null };
  }

  const { data: urlData } = supabase.storage
    .from("receipts")
    .getPublicUrl(fileName);

  return { error: null, url: urlData.publicUrl };
}

export async function getBirthdayMembers() {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12

  const { data, error } = await supabase
    .from("members")
    .select("id, name, photo_url, phone, birth_date, ministry, status")
    .eq("tenant_id", tenantId)
    .not("birth_date", "is", null);

  if (error) {
    console.error("Erro ao buscar aniversariantes:", error);
    return [];
  }

  // Filtrar aniversariantes do mês
  const birthdayMembers = (data || [])
    .filter((m) => {
      if (!m.birth_date) return false;
      const birthMonth = new Date(m.birth_date + "T12:00:00").getMonth() + 1;
      return birthMonth === currentMonth;
    })
    .sort((a, b) => {
      const dayA = new Date(a.birth_date + "T12:00:00").getDate();
      const dayB = new Date(b.birth_date + "T12:00:00").getDate();
      return dayA - dayB;
    });

  return birthdayMembers;
}
