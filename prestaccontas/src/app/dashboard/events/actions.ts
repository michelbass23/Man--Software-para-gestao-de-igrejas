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

export async function getEvents(filters?: {
  search?: string;
  eventType?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const page = filters?.page || 1;
  const limit = filters?.limit || 12;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("events")
    .select("*", { count: "exact" })
    .eq("tenant_id", tenantId)
    .order("event_date", { ascending: true });

  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location.ilike.%${filters.search}%,responsible_name.ilike.%${filters.search}%`
    );
  }

  if (filters?.eventType) {
    query = query.eq("event_type", filters.eventType);
  }

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    console.error("Erro ao buscar eventos:", error);
    return { events: [], total: 0 };
  }

  return { events: data || [], total: count || 0 };
}

export async function getEvent(id: string) {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .single();

  if (error) {
    console.error("Erro ao buscar evento:", error);
    return null;
  }

  return data;
}

export async function createEvent(data: {
  title: string;
  description?: string;
  eventType: string;
  eventDate: string;
  eventTime?: string;
  location?: string;
  bannerUrl?: string;
  responsibleName?: string;
  status?: string;
}) {
  const supabase = await createClient();
  const tenantId = await getTenantId();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("events").insert({
    tenant_id: tenantId,
    title: data.title,
    description: data.description || null,
    event_type: data.eventType,
    event_date: data.eventDate,
    event_time: data.eventTime || null,
    location: data.location || null,
    banner_url: data.bannerUrl || null,
    responsible_name: data.responsibleName || null,
    status: data.status || "ativo",
    recorded_by: user?.id || null,
  });

  if (error) {
    console.error("Erro ao criar evento:", error);
    return { error: "Erro ao salvar evento" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/events");
  return { error: null };
}

export async function updateEvent(
  id: string,
  data: {
    title: string;
    description?: string;
    eventType: string;
    eventDate: string;
    eventTime?: string;
    location?: string;
    bannerUrl?: string;
    responsibleName?: string;
    status?: string;
  }
) {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const { error } = await supabase
    .from("events")
    .update({
      title: data.title,
      description: data.description || null,
      event_type: data.eventType,
      event_date: data.eventDate,
      event_time: data.eventTime || null,
      location: data.location || null,
      banner_url: data.bannerUrl || null,
      responsible_name: data.responsibleName || null,
      status: data.status || "ativo",
    })
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("Erro ao atualizar evento:", error);
    return { error: `Erro ao atualizar evento: ${error.message}` };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/events");
  return { error: null };
}

export async function deleteEvent(id: string) {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("Erro ao deletar evento:", error);
    return { error: "Erro ao deletar evento" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/events");
  return { error: null };
}

export async function uploadEventBanner(file: File) {
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
  const fileName = `banners/${tenantId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from("receipts")
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Erro no upload do banner:", uploadError);
    return { error: "Erro ao fazer upload do banner", url: null };
  }

  const { data: urlData } = supabase.storage
    .from("receipts")
    .getPublicUrl(fileName);

  return { error: null, url: urlData.publicUrl };
}

export async function getActiveMembersWithPhone() {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const { data, error } = await supabase
    .from("members")
    .select("id, name, phone")
    .eq("tenant_id", tenantId)
    .eq("status", "ativo")
    .not("phone", "is", null)
    .order("name", { ascending: true });

  if (error) {
    console.error("Erro ao buscar membros:", error);
    return [];
  }

  return (data || []).filter(
    (m) => m.phone && m.phone.replace(/\D/g, "").length >= 10
  );
}
