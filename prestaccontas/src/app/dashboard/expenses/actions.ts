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

export async function getExpenses(filters?: {
  search?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("expenses")
    .select("id, tenant_id, date, category, amount, description, person_name, receipt_url, recorded_by, created_at, updated_at, is_fixed, is_recurring, due_day, next_due_date, status", { count: "exact" })
    .eq("tenant_id", tenantId)
    .eq("is_fixed", false)
    .order("date", { ascending: false });

  if (filters?.search) {
    query = query.or(
      `description.ilike.%${filters.search}%,person_name.ilike.%${filters.search}%`
    );
  }

  if (filters?.category) {
    query = query.eq("category", filters.category);
  }

  if (filters?.startDate) {
    query = query.gte("date", filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte("date", filters.endDate);
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    console.error("Erro ao buscar despesas:", error);
    return { expenses: [], total: 0 };
  }

  return { expenses: data || [], total: count || 0 };
}

export async function getFixedExpenses() {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const { data, error } = await supabase
    .from("expenses")
    .select("id, tenant_id, date, category, amount, description, person_name, receipt_url, recorded_by, created_at, updated_at, is_fixed, is_recurring, due_day, next_due_date, status")
    .eq("tenant_id", tenantId)
    .eq("is_fixed", true)
    .order("next_due_date", { ascending: true });

  if (error) {
    console.error("Erro ao buscar despesas fixas:", error);
    return [];
  }

  return data || [];
}

export async function createExpense(data: {
  date: string;
  category: string;
  amount: number;
  description?: string;
  personName?: string;
  receiptUrl?: string;
  isFixed?: boolean;
  dueDay?: number;
  nextDueDate?: string;
}) {
  const supabase = await createClient();
  const tenantId = await getTenantId();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("createExpense - receiptUrl recebido:", data.receiptUrl);

  const insertData: Record<string, unknown> = {
    tenant_id: tenantId,
    date: data.date,
    category: data.category,
    amount: data.amount,
    description: data.description || null,
    person_name: data.personName || null,
    receipt_url: data.receiptUrl || null,
    recorded_by: user?.id || null,
    is_fixed: data.isFixed || false,
  };

  if (data.isFixed) {
    insertData.is_recurring = true;
    insertData.due_day = data.dueDay || null;
    insertData.next_due_date = data.nextDueDate || null;
    insertData.status = "pending";
  }

  const { error } = await supabase.from("expenses").insert(insertData);

  if (error) {
    console.error("Erro ao criar despesa:", error);
    return { error: "Erro ao salvar despesa" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/expenses");
  revalidatePath("/dashboard/fixed-expenses");
  return { error: null };
}

export async function updateExpense(
  id: string,
  data: {
    date: string;
    category: string;
    amount: number;
    description: string;
    personName: string;
    receiptUrl?: string;
    isFixed?: boolean;
    dueDay?: number;
    nextDueDate?: string;
    status?: string;
  }
) {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  console.log("updateExpense - receiptUrl recebido:", data.receiptUrl);

  const updateData: Record<string, unknown> = {
    date: data.date,
    category: data.category,
    amount: data.amount,
    description: data.description || null,
    person_name: data.personName || null,
    receipt_url: data.receiptUrl || null,
  };

  if (data.isFixed !== undefined) {
    updateData.is_fixed = data.isFixed;
    updateData.is_recurring = data.isFixed;
  }
  if (data.dueDay !== undefined) updateData.due_day = data.dueDay;
  if (data.nextDueDate !== undefined) updateData.next_due_date = data.nextDueDate;
  if (data.status !== undefined) updateData.status = data.status;

  const { error } = await supabase
    .from("expenses")
    .update(updateData)
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("Erro ao atualizar despesa:", error);
    return { error: `Erro ao atualizar despesa: ${error.message}` };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/expenses");
  revalidatePath("/dashboard/fixed-expenses");
  return { error: null };
}

export async function markExpenseAsPaid(id: string) {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const { data: expense } = await supabase
    .from("expenses")
    .select("due_day, is_fixed")
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .single();

  if (!expense) {
    return { error: "Despesa não encontrada" };
  }

  const updateData: Record<string, unknown> = {
    status: "paid",
  };

  if (expense.is_fixed && expense.due_day) {
    const now = new Date();
    let nextMonth = now.getMonth() + 1;
    let nextYear = now.getFullYear();
    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear++;
    }
    const nextDue = new Date(nextYear, nextMonth, expense.due_day);
    updateData.next_due_date = nextDue.toISOString().split("T")[0];
    updateData.status = "pending";
  }

  const { error } = await supabase
    .from("expenses")
    .update(updateData)
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("Erro ao marcar como pago:", error);
    return { error: "Erro ao atualizar despesa" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/expenses");
  revalidatePath("/dashboard/fixed-expenses");
  return { error: null };
}

export async function deleteExpense(id: string) {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("Erro ao deletar despesa:", error);
    return { error: "Erro ao deletar despesa" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/expenses");
  revalidatePath("/dashboard/fixed-expenses");
  return { error: null };
}
