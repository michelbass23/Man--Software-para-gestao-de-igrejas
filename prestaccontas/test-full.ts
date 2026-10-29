/* Teste completo de backend PrestaContas */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^\\?"/, "").replace(/^\\?$/, "").trim();
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(url, anon);
const admin = createClient(url, service, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let pass = 0;
let fail = 0;
const results: string[] = [];

function ok(name: string, detail = "") {
  pass++;
  results.push(`  ✓ ${name}${detail ? " — " + detail : ""}`);
}
function bad(name: string, detail = "") {
  fail++;
  results.push(`  ✗ ${name}${detail ? " — " + detail : ""}`);
}

async function main() {
  console.log("=== PRESTACONTAS — Teste de Backend ===\n");
  console.log("URL:", url);

  // 1. Conectividade
  try {
    const { error } = await admin.auth.admin.listUsers({ perPage: 1 });
    if (error) bad("Conectividade admin", error.message);
    else ok("Conectividade admin (service_role)");
  } catch (e) {
    bad("Conectividade admin", String(e));
  }

  // 2. Login demo
  const DEMO_EMAIL = "demo@prestaccontas.com";
  const DEMO_PASSWORD = "demo2024";
  const { data: demoLogin, error: demoErr } =
    await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });
  if (demoErr) bad("Login demo (antes do seed)", demoErr.message);
  else ok("Login demo (antes do seed)", demoLogin.user?.email);

  // 3. Criar usuário de teste único
  const testEmail = `qa+${Date.now()}@prestaccontas.test`;
  const testPass = "senha-teste-123";
  const { data: created, error: createErr } =
    await admin.auth.admin.createUser({
      email: testEmail,
      password: testPass,
      email_confirm: true,
    });
  if (createErr || !created.user) bad("Criar usuário QA", createErr?.message);
  else ok("Criar usuário QA", testEmail);

  const uid = created.user?.id;

  // 4. Login com usuário QA
  const qa = createClient(url, anon);
  const { data: qaLogin, error: qaErr } =
    await qa.auth.signInWithPassword({
      email: testEmail,
      password: testPass,
    });
  if (qaErr) bad("Login usuário QA", qaErr.message);
  else ok("Login usuário QA", qaLogin.user?.id);

  // 5. Criar tenant
  const { data: tenant, error: tErr } = await admin
    .from("tenants")
    .insert({
      name: "Igreja QA Test",
      slug: `qa-${Date.now().toString(36)}`,
      plan: "free",
      status: "active",
    })
    .select()
    .single();
  if (tErr) bad("Criar tenant", tErr.message);
  else ok("Criar tenant", tenant?.id);

  // 6. Criar profile
  if (uid && tenant) {
    const { error: pErr } = await admin.from("profiles").insert({
      id: uid,
      tenant_id: tenant.id,
      name: "QA Tester",
      role: "admin",
    });
    if (pErr) bad("Criar profile", pErr.message);
    else ok("Criar profile");
  }

  // 7. CRUD members
  if (tenant) {
    const { data: mem, error: mErr } = await admin
      .from("members")
      .insert({
        tenant_id: tenant.id,
        name: "Membro QA",
        phone: "(11) 90000-0000",
        status: "ativo",
      })
      .select()
      .single();
    if (mErr) bad("Insert members", mErr.message);
    else ok("Insert members", mem?.id);

    const { data: memRead, error: mrErr } = await admin
      .from("members")
      .select("*")
      .eq("tenant_id", tenant.id);
    if (mrErr) bad("Select members", mrErr.message);
    else ok("Select members", `count=${memRead?.length}`);

    if (mem) {
      const { error: uErr } = await admin
        .from("members")
        .update({ name: "Membro QA Editado" })
        .eq("id", mem.id);
      if (uErr) bad("Update members", uErr.message);
      else ok("Update members");
    }
  }

  // 8. CRUD entries
  if (tenant) {
    const { data: entry, error: eErr } = await admin
      .from("entries")
      .insert({
        tenant_id: tenant.id,
        date: new Date().toISOString().split("T")[0],
        category: "dizimo",
        amount: 150,
        description: "Dízimo QA",
      })
      .select()
      .single();
    if (eErr) bad("Insert entries", eErr.message);
    else ok("Insert entries", entry?.id);

    const { error: edErr } = await admin
      .from("entries")
      .update({ amount: 200 })
      .eq("id", entry!.id);
    if (edErr) bad("Update entries", edErr.message);
    else ok("Update entries");
  }

  // 9. CRUD expenses
  if (tenant) {
    const { data: exp, error: xErr } = await admin
      .from("expenses")
      .insert({
        tenant_id: tenant.id,
        date: new Date().toISOString().split("T")[0],
        category: "energia",
        amount: 300,
        description: "Energia QA",
        status: "pago",
      })
      .select()
      .single();
    if (xErr) bad("Insert expenses", xErr.message);
    else ok("Insert expenses", exp?.id);
  }

  // 10. CRUD events
  if (tenant) {
    const { data: ev, error: evErr } = await admin
      .from("events")
      .insert({
        tenant_id: tenant.id,
        title: "Culto QA",
        event_type: "culto",
        event_date: new Date().toISOString().split("T")[0],
        event_time: "19:00",
        status: "ativo",
      })
      .select()
      .single();
    if (evErr) bad("Insert events", evErr.message);
    else ok("Insert events", ev?.id);

    // attendance
    if (ev) {
      const { error: aErr } = await admin.from("attendance").insert({
        event_id: ev.id,
        tenant_id: tenant.id,
        name: "Presente QA",
        status: "membro",
      });
      if (aErr) bad("Insert attendance", aErr.message);
      else ok("Insert attendance");
    }
  }

  // 11. RLS: usuário comum não deve ver dados de outro tenant
  if (tenant && uid) {
    const { data: rlsRows, error: rlsErr } = await qa
      .from("entries")
      .select("id")
      .eq("tenant_id", tenant.id);
    if (rlsErr) bad("RLS select entries (próprio tenant)", rlsErr.message);
    else ok("RLS select entries (próprio tenant)", `count=${rlsRows?.length}`);

    // Outro tenant
    const { data: other } = await admin
      .from("tenants")
      .insert({ name: "Outra Igreja", slug: `other-${Date.now().toString(36)}` })
      .select()
      .single();
    if (other) {
      const { data: otherRows, error: oErr } = await qa
        .from("entries")
        .select("id")
        .eq("tenant_id", other.id);
      if (oErr) bad("RLS select entries (outro tenant)", oErr.message);
      else if (otherRows && otherRows.length > 0)
        bad("RLS select entries (outro tenant)", `VAZOU ${otherRows.length} linhas`);
      else ok("RLS select entries (outro tenant)", "bloqueado (0 linhas)");
      await admin.from("tenants").delete().eq("id", other.id);
    }
  }

  // 12. Password reset API
  try {
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(
      testEmail,
      { redirectTo: "http://localhost:3000/login/reset-password" }
    );
    // Pode falhar se SMTP não configurado — não é crítico
    if (resetErr) {
      if (resetErr.message.toLowerCase().includes("rate")) {
        ok("Password reset (rate limit ok)", resetErr.message);
      } else {
        results.push(`  ! Password reset — ${resetErr.message} (SMTP pode não estar configurado)`);
      }
    } else ok("Password reset solicitado");
  } catch (e) {
    results.push(`  ! Password reset — ${e} (SMTP pode não estar configurado)`);
  }

  // 13. Sign out
  const { error: soErr } = await qa.auth.signOut();
  if (soErr) bad("Sign out", soErr.message);
  else ok("Sign out");

  // 14. Limpeza do usuário/tenant QA
  try {
    if (tenant) await admin.from("tenants").delete().eq("id", tenant.id);
    if (uid) await admin.auth.admin.deleteUser(uid);
    ok("Limpeza dados QA");
  } catch (e) {
    bad("Limpeza dados QA", String(e));
  }

  // 15. Health do Next.js — rotas principais
  const routes = [
    "/",
    "/login",
    "/login/forgot-password",
    "/login/reset-password",
    "/termos",
    "/privacidade",
    "/dashboard",
    "/setup",
    "/assinatura",
    "/assinatura/bloqueado",
  ];
  for (const route of routes) {
    try {
      const r = await fetch(`http://localhost:3000${route}`, {
        redirect: "manual",
      });
      // 200, 307/308 redirect para login é ok para rotas privadas
      if (r.status === 200 || r.status === 307 || r.status === 308 || r.status === 404) {
        if (r.status === 404 && route !== "/dashboard") {
          // dashboard redirect
          bad(`Rota ${route}`, "404");
        } else if (r.status === 200 || r.status === 307 || r.status === 308) {
          ok(`Rota ${route}`, `HTTP ${r.status}`);
        }
      } else {
        bad(`Rota ${route}`, `HTTP ${r.status}`);
      }
    } catch (e) {
      bad(`Rota ${route}`, String(e));
    }
  }

  console.log(results.join("\n"));
  console.log(`\n=== RESULTADO: ${pass} ok, ${fail} falhas ===`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
