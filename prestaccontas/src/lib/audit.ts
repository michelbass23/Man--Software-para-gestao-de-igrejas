import { createClient } from "@/lib/supabase/server";

export type AuditAction = "create" | "update" | "delete";
export type AuditEntityType =
  | "entry"
  | "expense"
  | "member"
  | "event"
  | "team_member";

export function diffFields<T extends Record<string, unknown>>(
  before: T | null | undefined,
  after: T,
  fields: (keyof T)[]
): Record<string, { from: unknown; to: unknown }> {
  const changes: Record<string, { from: unknown; to: unknown }> = {};
  if (!before) return changes;

  for (const field of fields) {
    const oldVal = before[field] ?? null;
    const newVal = after[field] ?? null;
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes[field as string] = { from: oldVal, to: newVal };
    }
  }

  return changes;
}

export async function logAudit(params: {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string;
  entityLabel?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id, name")
      .eq("id", user.id)
      .single();

    if (!profile) return;

    await supabase.from("audit_logs").insert({
      tenant_id: profile.tenant_id,
      user_id: user.id,
      user_name: profile.name || user.email || "Usuário",
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId,
      entity_label: params.entityLabel,
      metadata: params.metadata,
    });
  } catch (error) {
    // Falha ao logar não deve impedir a ação principal (delete/update) de completar
    console.error("Erro ao gravar audit log:", error);
  }
}
