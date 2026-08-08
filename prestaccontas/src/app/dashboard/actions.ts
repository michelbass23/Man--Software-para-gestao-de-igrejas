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

export async function getDashboardMetrics(month?: number, year?: number) {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const now = new Date();
  const targetMonth = month ?? now.getMonth() + 1;
  const targetYear = year ?? now.getFullYear();

  // Primeiro e último dia do mês
  const startDate = `${targetYear}-${String(targetMonth).padStart(2, "0")}-01`;
  const lastDay = new Date(targetYear, targetMonth, 0).getDate();
  const endDate = `${targetYear}-${String(targetMonth).padStart(2, "0")}-${lastDay}`;

  // Buscar entradas do mês
  const { data: entries } = await supabase
    .from("entries")
    .select("amount, category")
    .eq("tenant_id", tenantId)
    .gte("date", startDate)
    .lte("date", endDate);

  // Buscar despesas do mês
  const { data: expenses } = await supabase
    .from("expenses")
    .select("amount, category")
    .eq("tenant_id", tenantId)
    .gte("date", startDate)
    .lte("date", endDate);

  // Totais
  const totalEntries = (entries || []).reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );
  const totalExpenses = (expenses || []).reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );
  const netBalance = totalEntries - totalExpenses;

  // Entradas por categoria
  const entriesByCategory = Object.entries(
    (entries || []).reduce(
      (acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
        return acc;
      },
      {} as Record<string, number>
    )
  ).map(([category, total]) => ({ category, total, count: 0 }));

  // Despesas por categoria
  const expensesByCategory = Object.entries(
    (expenses || []).reduce(
      (acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
        return acc;
      },
      {} as Record<string, number>
    )
  ).map(([category, total]) => ({ category, total, count: 0 }));

  return {
    totalEntries,
    totalExpenses,
    netBalance,
    entriesByCategory,
    expensesByCategory,
  };
}

export async function getMonthlyData(year?: number) {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const targetYear = year ?? new Date().getFullYear();
  const months = [];

  for (let m = 1; m <= 12; m++) {
    const startDate = `${targetYear}-${String(m).padStart(2, "0")}-01`;
    const lastDay = new Date(targetYear, m, 0).getDate();
    const endDate = `${targetYear}-${String(m).padStart(2, "0")}-${lastDay}`;

    const [{ data: entries }, { data: expenses }] = await Promise.all([
      supabase
        .from("entries")
        .select("amount")
        .eq("tenant_id", tenantId)
        .gte("date", startDate)
        .lte("date", endDate),
      supabase
        .from("expenses")
        .select("amount")
        .eq("tenant_id", tenantId)
        .gte("date", startDate)
        .lte("date", endDate),
    ]);

    const monthNames = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
      "Jul", "Ago", "Set", "Out", "Nov", "Dez",
    ];

    months.push({
      month: monthNames[m - 1],
      entradas: (entries || []).reduce((sum, e) => sum + Number(e.amount), 0),
      saidas: (expenses || []).reduce((sum, e) => sum + Number(e.amount), 0),
    });
  }

  return months;
}

interface Transaction {
  id: string;
  type: "entry" | "expense";
  date: string;
  category: string;
  amount: number;
  description?: string;
}

export async function getRecentTransactions(limit = 8): Promise<Transaction[]> {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const [{ data: entries }, { data: expenses }] = await Promise.all([
    supabase
      .from("entries")
      .select("id, date, category, amount, description")
      .eq("tenant_id", tenantId)
      .order("date", { ascending: false })
      .limit(limit),
    supabase
      .from("expenses")
      .select("id, date, category, amount, description")
      .eq("tenant_id", tenantId)
      .order("date", { ascending: false })
      .limit(limit),
  ]);

  const allTransactions: Transaction[] = [
    ...(entries || []).map((e) => ({
      ...e,
      type: "entry" as const,
      amount: Number(e.amount),
    })),
    ...(expenses || []).map((e) => ({
      ...e,
      type: "expense" as const,
      amount: Number(e.amount),
    })),
  ];

  // Ordenar por data mais recente e limitar
  return allTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export async function getUserProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, tenants(*)")
    .eq("id", user.id)
    .single();

  return profile;
}

export async function getDashboardSummary() {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const now = new Date();
  const today = now.toISOString().split("T")[0];

  // Parallel queries
  const [
    { count: totalMembers },
    { data: birthdayMembers },
    { data: nextEvent },
    { data: upcomingFixedExpenses },
  ] = await Promise.all([
    // Total de membros ativos
    supabase
      .from("members")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("status", "ativo"),

    // Aniversariantes do mês
    supabase
      .from("members")
      .select("id, name, photo_url, phone, birth_date")
      .eq("tenant_id", tenantId)
      .eq("status", "ativo")
      .not("birth_date", "is", null),

    // Próximo evento ativo
    supabase
      .from("events")
      .select("id, title, event_date, event_time, location, event_type, banner_url")
      .eq("tenant_id", tenantId)
      .eq("status", "ativo")
      .gte("event_date", today)
      .order("event_date", { ascending: true })
      .limit(1)
      .single(),

    // Despesas fixas ativas
    supabase
      .from("expenses")
      .select("id, description, amount, due_day, next_due_date")
      .eq("tenant_id", tenantId)
      .eq("is_fixed", true)
      .eq("status", "pending"),
  ]);

  // Filtrar aniversariantes do mês atual
  const currentMonth = now.getMonth();
  const monthBirthdays = (birthdayMembers || []).filter((m) => {
    if (!m.birth_date) return false;
    const birth = new Date(m.birth_date + "T12:00:00");
    return birth.getMonth() === currentMonth;
  });

  // Filtrar aniversariantes de hoje
  const todayBirthdays = monthBirthdays.filter((m) => {
    if (!m.birth_date) return false;
    const birth = new Date(m.birth_date + "T12:00:00");
    return birth.getDate() === now.getDate();
  });

  // Filtrar contas vencendo nos próximos 7 dias
  const todayDay = now.getDate();
  const expiringExpenses = (upcomingFixedExpenses || [])
    .filter((e) => {
      if (e.next_due_date) {
        const dueDate = new Date(e.next_due_date + "T12:00:00");
        const diffDays = Math.ceil(
          (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        return diffDays >= 0 && diffDays <= 7;
      }
      if (e.due_day) {
        return e.due_day >= todayDay && e.due_day <= todayDay + 7;
      }
      return false;
    })
    .sort((a, b) => {
      if (a.next_due_date && b.next_due_date) {
        return a.next_due_date.localeCompare(b.next_due_date);
      }
      return (a.due_day || 0) - (b.due_day || 0);
    });

  return {
    totalMembers: totalMembers || 0,
    monthBirthdays,
    todayBirthdays,
    nextEvent: nextEvent || null,
    expiringExpenses,
  };
}
