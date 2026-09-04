"use server";

import { createClient } from "@/lib/supabase/server";

async function requireAdmin(): Promise<string> {
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
  if (profile.role !== "admin") throw new Error("Apenas administradores podem ver a auditoria");

  return profile.tenant_id;
}

export interface AuditLogEntry {
  id: string;
  user_name: string | null;
  action: "create" | "update" | "delete";
  entity_type: string;
  entity_id: string | null;
  entity_label: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export async function getAuditLogs(filters?: {
  entityType?: string;
  action?: string;
  page?: number;
  limit?: number;
}): Promise<{ logs: AuditLogEntry[]; total: number }> {
  const supabase = await createClient();
  const tenantId = await requireAdmin();

  const page = filters?.page || 1;
  const limit = filters?.limit || 30;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("audit_logs")
    .select("*", { count: "exact" })
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (filters?.entityType) {
    query = query.eq("entity_type", filters.entityType);
  }

  if (filters?.action) {
    query = query.eq("action", filters.action);
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    console.error("Erro ao buscar logs de auditoria:", error);
    return { logs: [], total: 0 };
  }

  return { logs: data || [], total: count || 0 };
}
