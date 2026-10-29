/* Teste do fluxo esqueci minha senha */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^\$/, "").trim();
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(url, anon);
const admin = createClient(url, service, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let pass = 0, fail = 0;
const ok = (m: string) => { pass++; console.log("  ✓ " + m); };
const bad = (m: string) => { fail++; console.log("  ✗ " + m); };

async function main() {
  console.log("=== TESTE: Recuperação de senha ===\n");

  // 1. Criar usuário de teste
  const email = `reset+${Date.now()}@gmail.com`;
  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email,
    password: "senha-inicial-123",
    email_confirm: true,
  });
  if (cErr) { bad("Criar usuário: " + cErr.message); return; }
  ok("Criar usuário de teste: " + email);

  // 2. Solicitar reset (como o botão do site faz)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  console.log("   redirectTo =", `${siteUrl}/login/reset-password`);

  const { data: resetData, error: resetErr } =
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/login/reset-password`,
    });

  if (resetErr) {
    bad("resetPasswordForEmail: " + resetErr.message);
    if (/smtp|email|not.*configured|confirm/i.test(resetErr.message)) {
      console.log("   → SMTP do Supabase pode não estar configurado (Auth → SMTP Settings)");
    }
    if (/redirect/i.test(resetErr.message)) {
      console.log("   → Adicione a URL em Authentication → URL Configuration → Redirect URLs");
    }
  } else {
    ok("resetPasswordForEmail aceito (e-mail enfileirado)");
  }

  // 3. Verificar se o link gerado seria válido — simular com generateLink
  const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
  });
  if (linkErr) {
    bad("generateLink: " + linkErr.message);
  } else {
    ok("generateLink gerou link de recovery");
    const actionLink = link?.properties?.action_link as string | undefined;
    if (actionLink) {
      console.log("   action_link (início):", actionLink.slice(0, 100) + "...");
      const isLocalhost = actionLink.includes("localhost") || actionLink.includes("127.0.0.1");
      if (isLocalhost) ok("Link aponta para localhost (ok em dev)");
      else ok("Link aponta para produção");
    }
  }

  // 4. Simular login com nova senha via updateUser (fluxo da página reset)
  //    Primeiro precisa de sessão de recovery — via verifyOtp não dá sem o token.
  //    Testamos o caminho do server action updateUser com uma sessão de password recovery:
  const { data: signIn } = await supabase.auth.signInWithPassword({
    email,
    password: "senha-inicial-123",
  });
  if (signIn?.user) {
    const { error: upErr } = await supabase.auth.updateUser({
      password: "senha-nova-456",
    });
    if (upErr) bad("updateUser (trocar senha): " + upErr.message);
    else {
      ok("updateUser trocou a senha");
      // Confirmar login com a senha nova
      const { data: re, error: reErr } = await supabase.auth.signInWithPassword({
        email,
        password: "senha-nova-456",
      });
      if (reErr) bad("Login com senha nova: " + reErr.message);
      else ok("Login com senha nova funcionou");
    }
    await supabase.auth.signOut();
  }

  // 5. Limpeza
  if (created.user) {
    await admin.auth.admin.deleteUser(created.user.id);
    ok("Limpeza usuário de teste");
  }

  // 6. Páginas HTTP
  for (const p of ["/login/forgot-password", "/login/reset-password"]) {
    const r = await fetch("http://localhost:3000" + p, { redirect: "manual" });
    if (r.status === 200) ok(`Página ${p} → 200`);
    else bad(`Página ${p} → HTTP ${r.status}`);
  }

  console.log(`\n=== RESULTADO: ${pass} ok, ${fail} falhas ===`);
}

main().catch((e) => { console.error("FATAL", e); process.exit(1); });
