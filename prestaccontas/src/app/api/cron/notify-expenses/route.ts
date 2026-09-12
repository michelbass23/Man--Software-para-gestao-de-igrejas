import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendPushToTenant } from "@/lib/push";

// Roda 1x/dia (ver vercel.json): gera alerta de despesa fixa vencendo/vencida
// pra TODOS os tenants (o gerador antigo só rodava sob demanda, quando
// alguém abria o dropdown de alertas — então ninguém recebia nada se
// ninguém tivesse o app aberto) e manda push pra cada alerta novo.

function todayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function addDaysString(days: number): string {
  const now = new Date();
  now.setDate(now.getDate() + days);
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function diffDays(a: string, b: string): number {
  const d1 = new Date(a + "T12:00:00");
  const d2 = new Date(b + "T12:00:00");
  return Math.round((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const admin = createAdminClient();
  const todayStr = todayString();
  const sevenDaysStr = addDaysString(7);

  const { data: fixedExpenses, error } = await admin
    .from("expenses")
    .select("id, tenant_id, description, next_due_date, amount, status")
    .eq("is_fixed", true)
    .not("next_due_date", "is", null)
    .lte("next_due_date", sevenDaysStr);

  if (error) {
    console.error("Erro ao buscar despesas fixas:", error);
    return NextResponse.json({ error: "Erro ao buscar despesas" }, { status: 500 });
  }

  const results = { created: 0, pushed: 0, errors: 0 };

  for (const expense of fixedExpenses || []) {
    try {
      const daysUntilDue = diffDays(expense.next_due_date, todayStr);
      const isOverdue = daysUntilDue < 0 && expense.status !== "paid";
      const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 7;
      if (!isOverdue && !isDueSoon) continue;

      const type = isOverdue ? "overdue" : "due_soon";
      const title = isOverdue
        ? "Despesa vencida!"
        : daysUntilDue === 0
          ? "Vence hoje!"
          : `Vence em ${daysUntilDue} dia${daysUntilDue > 1 ? "s" : ""}`;
      const message = isOverdue
        ? `${expense.description} - Venceu há ${Math.abs(daysUntilDue)} dia${Math.abs(daysUntilDue) > 1 ? "s" : ""} - R$ ${Number(expense.amount).toFixed(2)}`
        : `${expense.description} - R$ ${Number(expense.amount).toFixed(2)} - Vence em ${expense.next_due_date}`;

      const { data: existing } = await admin
        .from("alerts")
        .select("id")
        .eq("expense_id", expense.id)
        .eq("due_date", expense.next_due_date)
        .eq("type", type)
        .maybeSingle();

      let alertId = existing?.id as string | undefined;

      if (!alertId) {
        const { data: created, error: insertError } = await admin
          .from("alerts")
          .insert({
            tenant_id: expense.tenant_id,
            expense_id: expense.id,
            type,
            title,
            message,
            due_date: expense.next_due_date,
          })
          .select("id")
          .single();

        if (insertError) {
          console.error("Erro ao criar alerta:", insertError);
          results.errors++;
          continue;
        }
        alertId = created.id;
        results.created++;
      }

      await sendPushToTenant(expense.tenant_id, {
        title,
        body: message,
        url: "/dashboard",
        tag: `expense-${expense.id}`,
      });

      await admin
        .from("alerts")
        .update({ push_sent_at: new Date().toISOString() })
        .eq("id", alertId);

      results.pushed++;
    } catch (err) {
      console.error(`Erro ao processar despesa ${expense.id}:`, err);
      results.errors++;
    }
  }

  return NextResponse.json({ ok: true, ...results });
}
