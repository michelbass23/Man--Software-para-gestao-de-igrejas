"use server";

import { createClient } from "@/lib/supabase/server";

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

export interface AttendanceRecord {
  id: string;
  event_id: string;
  name: string;
  age: number | null;
  phone: string | null;
  status: "membro" | "visitante";
  checked_in_at: string;
}

export interface EventAttendance {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string | null;
  eventType: string;
  total: number;
  members: number;
  visitors: number;
}

export interface MemberAttendanceStats {
  name: string;
  totalAttended: number;
  memberCount: number;
  visitorCount: number;
  lastAttended: string;
  eventsAttended: string[];
}

export interface AttendanceSummary {
  totalEvents: number;
  totalCheckIns: number;
  totalMembers: number;
  totalVisitors: number;
  averageAttendance: number;
}

// Buscar resumo geral de presença
export async function getAttendanceSummary(
  startDate?: string,
  endDate?: string
): Promise<AttendanceSummary> {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  let eventsQuery = supabase
    .from("events")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("status", "concluido");

  if (startDate) eventsQuery = eventsQuery.gte("event_date", startDate);
  if (endDate) eventsQuery = eventsQuery.lte("event_date", endDate);

  const { data: events } = await eventsQuery;
  const eventIds = events?.map((e) => e.id) || [];

  if (eventIds.length === 0) {
    return {
      totalEvents: 0,
      totalCheckIns: 0,
      totalMembers: 0,
      totalVisitors: 0,
      averageAttendance: 0,
    };
  }

  const { data: attendance } = await supabase
    .from("attendance")
    .select("status")
    .in("event_id", eventIds);

  const totalCheckIns = attendance?.length || 0;
  const totalMembers =
    attendance?.filter((a) => a.status === "membro").length || 0;
  const totalVisitors =
    attendance?.filter((a) => a.status === "visitante").length || 0;

  return {
    totalEvents: eventIds.length,
    totalCheckIns,
    totalMembers,
    totalVisitors,
    averageAttendance:
      eventIds.length > 0
        ? Math.round(totalCheckIns / eventIds.length)
        : 0,
  };
}

// Buscar presença por evento
export async function getAttendanceByEvent(
  startDate?: string,
  endDate?: string
): Promise<EventAttendance[]> {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  let eventsQuery = supabase
    .from("events")
    .select("id, title, event_date, event_time, event_type")
    .eq("tenant_id", tenantId)
    .order("event_date", { ascending: false });

  if (startDate) eventsQuery = eventsQuery.gte("event_date", startDate);
  if (endDate) eventsQuery = eventsQuery.lte("event_date", endDate);

  const { data: events } = await eventsQuery;

  if (!events || events.length === 0) return [];

  const eventIds = events.map((e) => e.id);

  const { data: attendance } = await supabase
    .from("attendance")
    .select("event_id, status")
    .in("event_id", eventIds);

  const attendanceMap = new Map<
    string,
    { total: number; members: number; visitors: number }
  >();

  for (const record of attendance || []) {
    const existing = attendanceMap.get(record.event_id) || {
      total: 0,
      members: 0,
      visitors: 0,
    };
    existing.total++;
    if (record.status === "membro") existing.members++;
    else existing.visitors++;
    attendanceMap.set(record.event_id, existing);
  }

  return events.map((event) => {
    const stats = attendanceMap.get(event.id) || {
      total: 0,
      members: 0,
      visitors: 0,
    };
    return {
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.event_date,
      eventTime: event.event_time,
      eventType: event.event_type,
      ...stats,
    };
  });
}

// Buscar ranking de presença por pessoa
export async function getMemberAttendanceRanking(
  startDate?: string,
  endDate?: string
): Promise<MemberAttendanceStats[]> {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  let eventsQuery = supabase
    .from("events")
    .select("id")
    .eq("tenant_id", tenantId);

  if (startDate) eventsQuery = eventsQuery.gte("event_date", startDate);
  if (endDate) eventsQuery = eventsQuery.lte("event_date", endDate);

  const { data: events } = await eventsQuery;
  const eventIds = events?.map((e) => e.id) || [];

  if (eventIds.length === 0) return [];

  const { data: attendance } = await supabase
    .from("attendance")
    .select("name, status, event_id, checked_in_at")
    .in("event_id", eventIds)
    .order("checked_in_at", { ascending: false });

  if (!attendance) return [];

  const memberMap = new Map<
    string,
    {
      totalAttended: number;
      memberCount: number;
      visitorCount: number;
      lastAttended: string;
      eventsAttended: Set<string>;
    }
  >();

  for (const record of attendance) {
    const normalizedName = record.name.trim().toLowerCase();
    const existing = memberMap.get(normalizedName) || {
      totalAttended: 0,
      memberCount: 0,
      visitorCount: 0,
      lastAttended: record.checked_in_at,
      eventsAttended: new Set<string>(),
    };

    existing.totalAttended++;
    if (record.status === "membro") existing.memberCount++;
    else existing.visitorCount++;
    existing.eventsAttended.add(record.event_id);

    if (record.checked_in_at > existing.lastAttended) {
      existing.lastAttended = record.checked_in_at;
    }

    memberMap.set(normalizedName, existing);
  }

  // Buscar nomes originais (capitalizados)
  const { data: allAttendance } = await supabase
    .from("attendance")
    .select("name")
    .in("event_id", eventIds);

  const nameMap = new Map<string, string>();
  for (const a of allAttendance || []) {
    const normalized = a.name.trim().toLowerCase();
    if (!nameMap.has(normalized)) {
      nameMap.set(normalized, a.name.trim());
    }
  }

  const results: MemberAttendanceStats[] = [];

  for (const [normalizedName, stats] of memberMap) {
    results.push({
      name: nameMap.get(normalizedName) || normalizedName,
      totalAttended: stats.totalAttended,
      memberCount: stats.memberCount,
      visitorCount: stats.visitorCount,
      lastAttended: stats.lastAttended,
      eventsAttended: Array.from(stats.eventsAttended),
    });
  }

  // Ordenar por presença (mais frequente primeiro)
  results.sort((a, b) => b.totalAttended - a.totalAttended);

  return results;
}

// Buscar lista de faltosos (membros que menos compareceram)
export async function getAbsentMembers(
  startDate?: string,
  endDate?: string
): Promise<
  {
    name: string;
    attended: number;
    missed: number;
    attendanceRate: number;
    lastAttended: string | null;
  }[]
> {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  // Buscar eventos concluídos no período
  let eventsQuery = supabase
    .from("events")
    .select("id, title, event_date")
    .eq("tenant_id", tenantId)
    .order("event_date", { ascending: false });

  if (startDate) eventsQuery = eventsQuery.gte("event_date", startDate);
  if (endDate) eventsQuery = eventsQuery.lte("event_date", endDate);

  const { data: events } = await eventsQuery;
  const totalEvents = events?.length || 0;

  if (totalEvents === 0) return [];

  const eventIds = events!.map((e) => e.id);

  // Buscar presenças apenas de membros
  const { data: attendance } = await supabase
    .from("attendance")
    .select("name, event_id, checked_in_at")
    .in("event_id", eventIds)
    .eq("status", "membro");

  if (!attendance) return [];

  // Agrupar por membro
  const memberMap = new Map<
    string,
    {
      attended: Set<string>;
      lastAttended: string | null;
    }
  >();

  for (const record of attendance) {
    const normalizedName = record.name.trim().toLowerCase();
    const existing = memberMap.get(normalizedName) || {
      attended: new Set<string>(),
      lastAttended: null,
    };

    existing.attended.add(record.event_id);
    if (!existing.lastAttended || record.checked_in_at > existing.lastAttended) {
      existing.lastAttended = record.checked_in_at;
    }

    memberMap.set(normalizedName, existing);
  }

  // Buscar nomes originais
  const { data: allAttendance } = await supabase
    .from("attendance")
    .select("name")
    .in("event_id", eventIds)
    .eq("status", "membro");

  const nameMap = new Map<string, string>();
  for (const a of allAttendance || []) {
    const normalized = a.name.trim().toLowerCase();
    if (!nameMap.has(normalized)) {
      nameMap.set(normalized, a.name.trim());
    }
  }

  const results = [];

  for (const [normalizedName, stats] of memberMap) {
    const attended = stats.attended.size;
    const missed = totalEvents - attended;
    const attendanceRate = Math.round((attended / totalEvents) * 100);

    results.push({
      name: nameMap.get(normalizedName) || normalizedName,
      attended,
      missed,
      attendanceRate,
      lastAttended: stats.lastAttended,
    });
  }

  // Ordenar por taxa de presença (menor primeiro = mais faltosos)
  results.sort((a, b) => a.attendanceRate - b.attendanceRate);

  return results;
}

// Buscar detalhes de presença de um evento específico
export async function getEventAttendanceDetails(eventId: string) {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  // Verificar se o evento pertence ao tenant
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .eq("tenant_id", tenantId)
    .single();

  if (!event) return { event: null, attendance: [] };

  const { data: attendance } = await supabase
    .from("attendance")
    .select("*")
    .eq("event_id", eventId)
    .order("checked_in_at", { ascending: true });

  return {
    event,
    attendance: attendance || [],
  };
}
