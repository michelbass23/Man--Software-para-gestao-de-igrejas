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

export async function getReportData(month?: number, year?: number) {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const now = new Date();
  const targetMonth = month ?? now.getMonth() + 1;
  const targetYear = year ?? now.getFullYear();

  const startDate = `${targetYear}-${String(targetMonth).padStart(2, "0")}-01`;
  const lastDay = new Date(targetYear, targetMonth, 0).getDate();
  const endDate = `${targetYear}-${String(targetMonth).padStart(2, "0")}-${lastDay}`;

  // Buscar tenant com logo
  const { data: tenant } = await supabase
    .from("tenants")
    .select("name, logo_url")
    .eq("id", tenantId)
    .single();

  // Buscar entradas
  const { data: entries } = await supabase
    .from("entries")
    .select("date, category, amount, description, person_name")
    .eq("tenant_id", tenantId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  // Buscar despesas
  const { data: expenses } = await supabase
    .from("expenses")
    .select("date, category, amount, description, person_name")
    .eq("tenant_id", tenantId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  const totalEntries = (entries || []).reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );
  const totalExpenses = (expenses || []).reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  // Agrupar entradas por categoria
  const entriesByCategory = (entries || []).reduce(
    (acc, e) => {
      const cat = e.category;
      if (!acc[cat]) {
        acc[cat] = { category: cat, total: 0, count: 0 };
      }
      acc[cat].total += Number(e.amount);
      acc[cat].count += 1;
      return acc;
    },
    {} as Record<string, { category: string; total: number; count: number }>
  );

  // Agrupar despesas por categoria
  const expensesByCategory = (expenses || []).reduce(
    (acc, e) => {
      const cat = e.category;
      if (!acc[cat]) {
        acc[cat] = { category: cat, total: 0, count: 0 };
      }
      acc[cat].total += Number(e.amount);
      acc[cat].count += 1;
      return acc;
    },
    {} as Record<string, { category: string; total: number; count: number }>
  );

  return {
    churchName: tenant?.name || "Igreja",
    logoUrl: tenant?.logo_url || null,
    month: targetMonth,
    year: targetYear,
    startDate,
    endDate,
    entries: entries || [],
    expenses: expenses || [],
    entriesByCategory: Object.values(entriesByCategory),
    expensesByCategory: Object.values(expensesByCategory),
    totalEntries,
    totalExpenses,
    balance: totalEntries - totalExpenses,
  };
}
