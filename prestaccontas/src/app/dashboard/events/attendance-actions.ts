"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";

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

// Gerar token de check-in para um evento
export async function generateAttendanceToken(eventId: string) {
  const supabase = await createClient();
  const tenantId = await getTenantId();
  const admin = createAdminClient();

  // Desativar tokens anteriores deste evento
  await admin
    .from("attendance_tokens")
    .update({ is_active: false })
    .eq("event_id", eventId)
    .eq("tenant_id", tenantId);

  // Gerar novo token
  const token = randomBytes(32).toString("hex");

  // Token válido por 5 minutos
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 5);

  const { data, error } = await admin
    .from("attendance_tokens")
    .insert({
      event_id: eventId,
      tenant_id: tenantId,
      token,
      is_active: true,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao gerar token:", error);
    return { error: "Erro ao gerar token de check-in" };
  }

  return {
    error: null,
    token: data.token,
    expiresAt: data.expires_at,
  };
}

// Verificar se token é válido (público - sem auth)
export async function verifyAttendanceToken(token: string) {
  const admin = createAdminClient();

  const { data: tokenData, error } = await admin
    .from("attendance_tokens")
    .select("*, events(title, event_date, event_time, location, tenant_id, tenants(name))")
    .eq("token", token)
    .eq("is_active", true)
    .single();

  if (error || !tokenData) {
    return { valid: false, error: "Token inválido ou expirado" };
  }

  // Verificar se não expirou
  const now = new Date();
  const expiresAt = new Date(tokenData.expires_at);

  if (now > expiresAt) {
    // Desativar token expirado
    await admin
      .from("attendance_tokens")
      .update({ is_active: false })
      .eq("id", tokenData.id);

    return { valid: false, error: "Token expirado. Peça um novo QR Code." };
  }

  const event = tokenData.events as any;
  const tenant = event?.tenants as any;

  return {
    valid: true,
    eventId: tokenData.event_id,
    tokenId: tokenData.id,
    tenantId: tokenData.tenant_id,
    eventName: event?.title || "Evento",
    eventDate: event?.event_date,
    eventTime: event?.event_time,
    eventLocation: event?.location,
    churchName: tenant?.name || "Igreja",
    expiresAt: tokenData.expires_at,
  };
}

// Registrar presença (público - sem auth)
export async function registerAttendance(data: {
  token: string;
  name: string;
  age?: number;
  phone?: string;
  status: "membro" | "visitante";
  deviceFingerprint?: string;
}) {
  const admin = createAdminClient();

  // Verificar token
  const tokenVerification = await verifyAttendanceToken(data.token);
  if (!tokenVerification.valid) {
    return { error: tokenVerification.error };
  }

  // Registrar presença (sem verificar fingerprint - permite uso de tablet compartilhado)
  const { error } = await admin.from("attendance").insert({
    event_id: tokenVerification.eventId,
    tenant_id: tokenVerification.tenantId,
    token_id: tokenVerification.tokenId,
    name: data.name.trim(),
    age: data.age || null,
    phone: data.phone?.trim() || null,
    status: data.status,
    device_fingerprint: null,
  });

  if (error) {
    console.error("Erro ao registrar presença:", error);
    return { error: "Erro ao registrar presença" };
  }

  return { error: null, success: true };
}

// Registrar presença via link fixo (público - sem auth, sem token)
export async function registerAttendanceFixed(data: {
  eventId: string;
  name: string;
  age?: number;
  phone?: string;
  status: "membro" | "visitante";
}) {
  const admin = createAdminClient();

  // Verificar se o evento existe
  const { data: event, error: eventError } = await admin
    .from("events")
    .select("id, tenant_id, status")
    .eq("id", data.eventId)
    .single();

  if (eventError || !event) {
    return { error: "Evento não encontrado" };
  }

  if (event.status === "cancelado") {
    return { error: "Este evento foi cancelado" };
  }

  // Registrar presença
  const { error } = await admin.from("attendance").insert({
    event_id: event.id,
    tenant_id: event.tenant_id,
    name: data.name.trim(),
    age: data.age || null,
    phone: data.phone?.trim() || null,
    status: data.status,
    device_fingerprint: null,
  });

  if (error) {
    console.error("Erro ao registrar presença:", error);
    return { error: "Erro ao registrar presença" };
  }

  return { error: null, success: true };
}

// Buscar informações do evento para link fixo (público - sem auth)
export async function getEventInfoForCheckIn(eventId: string) {
  const admin = createAdminClient();

  const { data: event, error } = await admin
    .from("events")
    .select("id, title, event_date, event_time, location, status, tenant_id, tenants(name)")
    .eq("id", eventId)
    .single();

  if (error || !event) {
    return { valid: false, error: "Evento não encontrado" };
  }

  if (event.status === "cancelado") {
    return { valid: false, error: "Este evento foi cancelado" };
  }

  const tenant = event.tenants as any;

  return {
    valid: true,
    eventId: event.id,
    eventName: event.title,
    eventDate: event.event_date,
    eventTime: event.event_time,
    eventLocation: event.location,
    churchName: tenant?.name || "Igreja",
  };
}

// Buscar presenças de um evento
export async function getEventAttendance(eventId: string) {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("event_id", eventId)
    .eq("tenant_id", tenantId)
    .order("checked_in_at", { ascending: true });

  if (error) {
    console.error("Erro ao buscar presenças:", error);
    return [];
  }

  return data || [];
}

// Buscar estatísticas de presença
export async function getAttendanceStats(eventId: string) {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const { data, error } = await supabase
    .from("attendance")
    .select("status")
    .eq("event_id", eventId)
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return { total: 0, members: 0, visitors: 0 };
  }

  const total = data?.length || 0;
  const members = data?.filter((a) => a.status === "membro").length || 0;
  const visitors = data?.filter((a) => a.status === "visitante").length || 0;

  return { total, members, visitors };
}

// Limpar tokens expirados
export async function cleanupExpiredTokens() {
  const admin = createAdminClient();

  const { error } = await admin
    .from("attendance_tokens")
    .update({ is_active: false })
    .eq("is_active", true)
    .lt("expires_at", new Date().toISOString());

  if (error) {
    console.error("Erro ao limpar tokens:", error);
  }
}

// Relatorio completo de um evento (presenca + faltosos)
export async function getEventReport(eventId: string) {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  // Buscar evento
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .eq("tenant_id", tenantId)
    .single();

  if (!event) return { event: null, attendance: [], absentMembers: [] };

  // Buscar presencas
  const { data: attendance } = await supabase
    .from("attendance")
    .select("*")
    .eq("event_id", eventId)
    .order("checked_in_at", { ascending: true });

  // Buscar membros ativos para comparar com presenca
  const { data: members } = await supabase
    .from("members")
    .select("id, name, phone")
    .eq("tenant_id", tenantId)
    .eq("status", "ativo");

  // Membros que faltaram (nao fizeram check-in)
  const attendedNames = new Set(
    (attendance || [])
      .filter((a) => a.status === "membro")
      .map((a) => a.name.trim().toLowerCase())
  );

  const absentMembers = (members || [])
    .filter((m) => !attendedNames.has(m.name.trim().toLowerCase()))
    .map((m) => ({ id: m.id, name: m.name, phone: m.phone }));

  return {
    event,
    attendance: attendance || [],
    absentMembers,
  };
}
