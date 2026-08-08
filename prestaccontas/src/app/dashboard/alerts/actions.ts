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

export interface Alert {
  id: string;
  type: "due_soon" | "overdue" | "custom";
  title: string;
  message: string;
  due_date: string;
  is_read: boolean;
  expense_id?: string;
}

export async function getAlerts(unreadOnly = false): Promise<Alert[]> {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  let query = supabase
    .from("alerts")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("due_date", { ascending: true });

  if (unreadOnly) {
    query = query.eq("is_read", false);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar alertas:", error);
    return [];
  }

  return data || [];
}

export async function getAlertCount(): Promise<number> {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const { count, error } = await supabase
    .from("alerts")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("is_read", false);

  if (error) {
    console.error("Erro ao contar alertas:", error);
    return 0;
  }

  return count || 0;
}

export async function markAlertAsRead(alertId: string) {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const { error } = await supabase
    .from("alerts")
    .update({ is_read: true })
    .eq("id", alertId)
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("Erro ao marcar alerta como lido:", error);
    return { error: "Erro ao atualizar alerta" };
  }

  revalidatePath("/dashboard");
  return { error: null };
}

export async function markAllAlertsAsRead() {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const { error } = await supabase
    .from("alerts")
    .update({ is_read: true })
    .eq("tenant_id", tenantId)
    .eq("is_read", false);

  if (error) {
    console.error("Erro ao marcar alertas como lidos:", error);
    return { error: "Erro ao atualizar alertas" };
  }

  revalidatePath("/dashboard");
  return { error: null };
}

export async function deleteAlert(alertId: string) {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const { error } = await supabase
    .from("alerts")
    .delete()
    .eq("id", alertId)
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("Erro ao deletar alerta:", error);
    return { error: "Erro ao deletar alerta" };
  }

  revalidatePath("/dashboard");
  return { error: null };
}

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateString(daysFromNow: number): string {
  const now = new Date();
  now.setDate(now.getDate() + daysFromNow);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function diffDays(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1 + "T12:00:00");
  const d2 = new Date(dateStr2 + "T12:00:00");
  return Math.round((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
}

export async function generateAlerts() {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const todayStr = getTodayString();
  const sevenDaysStr = getDateString(7);

  console.log("Gerando alertas para:", { todayStr, sevenDaysStr });

  // Buscar TODAS as despesas fixas (não filtrar por status para não perder nenhuma)
  const { data: fixedExpenses, error: fetchError } = await supabase
    .from("expenses")
    .select("id, description, next_due_date, amount, status")
    .eq("tenant_id", tenantId)
    .eq("is_fixed", true);

  if (fetchError) {
    console.error("Erro ao buscar despesas fixas:", fetchError);
    return;
  }

  console.log("Despesas fixas encontradas:", fixedExpenses?.length || 0);

  if (!fixedExpenses || fixedExpenses.length === 0) return;

  // Filtrar despesas com vencimento nos próximos 7 dias ou já vencidas
  const relevantExpenses = fixedExpenses.filter((e) => {
    if (!e.next_due_date) return false;
    // Incluir se vence em até 7 dias ou já venceu
    return e.next_due_date <= sevenDaysStr;
  });

  console.log("Despesas relevantes para alertas:", relevantExpenses.length);

  if (relevantExpenses.length === 0) return;

  // Verificar quais já têm alertas
  const expenseIds = relevantExpenses.map((e) => e.id);
  const { data: existingAlerts } = await supabase
    .from("alerts")
    .select("expense_id, due_date, type")
    .eq("tenant_id", tenantId)
    .in("expense_id", expenseIds);

  const existingSet = new Set(
    (existingAlerts || []).map((a) => `${a.expense_id}-${a.due_date}-${a.type}`)
  );

  console.log("Alertas existentes:", existingSet.size);

  const newAlerts = [];

  for (const expense of relevantExpenses) {
    const daysUntilDue = diffDays(expense.next_due_date, todayStr);

    console.log(`Despesa ${expense.description}:`, {
      dueDate: expense.next_due_date,
      daysUntilDue,
      status: expense.status,
    });

    // Despesa vencida (status paid não gera alerta de vencida)
    if (daysUntilDue < 0 && expense.status !== "paid") {
      const key = `${expense.id}-${expense.next_due_date}-overdue`;
      if (!existingSet.has(key)) {
        newAlerts.push({
          tenant_id: tenantId,
          expense_id: expense.id,
          type: "overdue" as const,
          title: "Despesa vencida!",
          message: `${expense.description} - Venceu há ${Math.abs(daysUntilDue)} dia${Math.abs(daysUntilDue) > 1 ? "s" : ""} - R$ ${Number(expense.amount).toFixed(2)}`,
          due_date: expense.next_due_date,
        });
      }
    }
    // Despesa vencendo em até 7 dias
    else if (daysUntilDue >= 0 && daysUntilDue <= 7) {
      const key = `${expense.id}-${expense.next_due_date}-due_soon`;
      if (!existingSet.has(key)) {
        const titleText = daysUntilDue === 0 
          ? "Vence hoje!" 
          : `Vence em ${daysUntilDue} dia${daysUntilDue > 1 ? "s" : ""}`;
        
        newAlerts.push({
          tenant_id: tenantId,
          expense_id: expense.id,
          type: "due_soon" as const,
          title: titleText,
          message: `${expense.description} - R$ ${Number(expense.amount).toFixed(2)} - Vence em ${expense.next_due_date}`,
          due_date: expense.next_due_date,
        });
      }
    }
  }

  console.log("Novos alertas a criar:", newAlerts.length);

  if (newAlerts.length > 0) {
    const { error: insertError } = await supabase.from("alerts").insert(newAlerts);
    if (insertError) {
      console.error("Erro ao criar alertas:", insertError);
    } else {
      console.log("Alertas criados com sucesso!");
    }
  }
}

export async function getPendingAlerts(): Promise<Alert[]> {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  // Gerar alertas primeiro
  await generateAlerts();

  // Buscar alertas não lidos
  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_read", false)
    .order("due_date", { ascending: true });

  if (error) {
    console.error("Erro ao buscar alertas pendentes:", error);
    return [];
  }

  console.log("Alertas pendentes retornados:", data?.length || 0);
  return data || [];
}
