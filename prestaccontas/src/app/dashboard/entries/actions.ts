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

export async function getEntries(filters?: {
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
    .from("entries")
    .select("id, tenant_id, date, category, amount, description, person_name, receipt_url, recorded_by, created_at, updated_at", { count: "exact" })
    .eq("tenant_id", tenantId)
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
    console.error("Erro ao buscar entradas:", error);
    return { entries: [], total: 0 };
  }

  // Log para debug - verificar se receipt_url está vindo
  if (data && data.length > 0) {
    console.log("getEntries - primeira entrada:", {
      id: data[0].id,
      receipt_url: data[0].receipt_url,
      todos_os_campos: Object.keys(data[0]),
    });
  }

  return { entries: data || [], total: count || 0 };
}

export async function createEntry(data: {
  date: string;
  category: string;
  amount: number;
  description?: string;
  personName?: string;
  receiptUrl?: string;
}) {
  const supabase = await createClient();
  const tenantId = await getTenantId();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("createEntry - receiptUrl recebido:", data.receiptUrl);

  const insertData: Record<string, unknown> = {
    tenant_id: tenantId,
    date: data.date,
    category: data.category,
    amount: data.amount,
    description: data.description || null,
    person_name: data.personName || null,
    receipt_url: data.receiptUrl || null,
    recorded_by: user?.id || null,
  };

  console.log("createEntry - insertData:", insertData);

  const { data: result, error } = await supabase
    .from("entries")
    .insert(insertData)
    .select();

  if (error) {
    console.error("Erro ao criar entrada:", error);
    return { error: "Erro ao salvar entrada" };
  }

  console.log("createEntry - resultado:", result);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/entries");
  return { error: null };
}

export async function updateEntry(
  id: string,
  data: {
    date: string;
    category: string;
    amount: number;
    description: string;
    personName: string;
    receiptUrl?: string;
  }
) {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  console.log("updateEntry - receiptUrl recebido:", data.receiptUrl);

  const updateData: Record<string, unknown> = {
    date: data.date,
    category: data.category,
    amount: data.amount,
    description: data.description || null,
    person_name: data.personName || null,
    receipt_url: data.receiptUrl || null,
  };

  console.log("updateEntry - updateData:", updateData);

  const { data: result, error } = await supabase
    .from("entries")
    .update(updateData)
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .select();

  if (error) {
    console.error("Erro ao atualizar entrada:", error);
    return { error: `Erro ao atualizar entrada: ${error.message}` };
  }

  console.log("updateEntry - resultado:", result);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/entries");
  return { error: null };
}

export async function deleteEntry(id: string) {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const { error } = await supabase
    .from("entries")
    .delete()
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("Erro ao deletar entrada:", error);
    return { error: "Erro ao deletar entrada" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/entries");
  return { error: null };
}
