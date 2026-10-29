/* Valida schema + seed demo real */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^\$/, "").trim();
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const admin = createClient(url, service, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  // 1. Colunas de expenses
  const { data: cols, error: colErr } = await admin
    .from("expenses")
    .select("*")
    .limit(1);

  // Tentar insert com todos os campos do demo
  const { data: t } = await admin
    .from("tenants")
    .insert({ name: "SchemaCheck", slug: `sc-${Date.now().toString(36)}` })
    .select()
    .single();

  if (!t) {
    console.log("Falha ao criar tenant de teste", colErr);
    return;
  }

  const tryInsert = async (label: string, row: Record<string, unknown>) => {
    const { error } = await admin.from("expenses").insert(row);
    console.log(label, error ? `FAIL: ${error.message}` : "OK");
    return !error;
  };

  await tryInsert("expense basico (sem status):", {
    tenant_id: t.id,
    date: "2026-10-01",
    category: "energia",
    amount: 100,
    description: "basico",
  });

  await tryInsert("expense status=paid:", {
    tenant_id: t.id,
    date: "2026-10-01",
    category: "energia",
    amount: 100,
    description: "paid",
    status: "paid",
  });

  await tryInsert("expense status=pago (deve falhar):", {
    tenant_id: t.id,
    date: "2026-10-01",
    category: "energia",
    amount: 100,
    description: "pago",
    status: "pago",
  });

  await tryInsert("expense is_fixed/due_day/is_recurring:", {
    tenant_id: t.id,
    date: "2026-10-01",
    category: "aluguel",
    amount: 100,
    description: "fixa",
    is_fixed: true,
    due_day: 10,
    is_recurring: true,
    status: "paid",
  });

  await tryInsert("expense next_due_date:", {
    tenant_id: t.id,
    date: "2026-10-01",
    category: "aluguel",
    amount: 100,
    description: "next_due",
    next_due_date: "2026-11-01",
    status: "paid",
  });

  // Members campos do demo
  const { error: memErr } = await admin.from("members").insert({
    tenant_id: t.id,
    name: "Teste",
    phone: "11999",
    status: "ativo",
    ministry: "Louvor",
    marital_status: "casado",
    birth_date: "1990-01-01",
  });
  console.log("member com ministry/marital/birth:", memErr ? `FAIL: ${memErr.message}` : "OK");

  // Entries campos do demo
  const { error: entErr } = await admin.from("entries").insert({
    tenant_id: t.id,
    date: "2026-10-01",
    category: "dizimo",
    amount: 100,
    description: "Dizimo",
    person_name: "João",
  });
  console.log("entry com person_name:", entErr ? `FAIL: ${entErr.message}` : "OK");

  // Attendance
  const { data: ev } = await admin
    .from("events")
    .insert({
      tenant_id: t.id,
      title: "Teste",
      event_type: "culto",
      event_date: "2026-10-01",
      event_time: "09:00",
      status: "concluido",
    })
    .select()
    .single();
  if (ev) {
    const { error: aErr } = await admin.from("attendance").insert({
      event_id: ev.id,
      tenant_id: t.id,
      name: "Visitante",
      status: "visitante",
      checked_in_at: new Date().toISOString(),
    });
    console.log("attendance com checked_in_at:", aErr ? `FAIL: ${aErr.message}` : "OK");
  }

  // Limpeza
  await admin.from("tenants").delete().eq("id", t.id);
  console.log("cleanup done");
}

main().catch((e) => console.error("FATAL", e));
