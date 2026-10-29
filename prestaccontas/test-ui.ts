/* UI smoke test — PrestaContas */
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
let pass = 0;
let fail = 0;
const log: string[] = [];
const ok = (m: string) => { pass++; log.push(`  ✓ ${m}`); };
const bad = (m: string) => { fail++; log.push(`  ✗ ${m}`); };

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  // Captura erros de console
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text().slice(0, 120));
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err).slice(0, 120)));

  try {
    // 1. Landing
    await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 30000 });
    const title = await page.title();
    if (title && title.length > 0) ok(`Landing carregou (title: ${title.slice(0, 40)})`);
    else bad("Landing sem title");

    // 2. Login page
    await page.goto(BASE + "/login", { waitUntil: "networkidle", timeout: 30000 });
    const hasEmail = await page.locator('input[name="email"]').count();
    const hasPass = await page.locator('input[name="password"]').count();
    const hasDemo = await page.getByRole("button", { name: /demonstração|demo/i }).count();
    if (hasEmail && hasPass) ok("Formulário de login presente");
    else bad("Formulário de login incompleto");
    if (hasDemo) ok("Botão demo presente");
    else bad("Botão demo ausente");

    // 3. Login com credenciais inválidas — deve mostrar erro
    await page.fill('input[name="email"]', "naoexiste@naoexiste.com");
    await page.fill('input[name="password"]', "errada123");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2500);
    const errVisible = await page.locator("text=incorretos").or(page.locator("text=Erro")).or(page.locator("text=conectar")).or(page.locator("text=senha")).count();
    if (errVisible > 0) ok("Login inválido mostra mensagem de erro");
    else bad("Login inválido não mostrou erro");

    // 4. Demo — deve entrar no dashboard
    const demoBtn = page.getByRole("button", { name: /demonstração|demo/i });
    if (await demoBtn.count()) {
      await demoBtn.first().click();
      // seed demora
      try {
        await page.waitForURL("**/dashboard**", { timeout: 90000 });
        ok("Demo redirecionou para /dashboard");
      } catch {
        const demoErr = await page.locator("text=Sem conexão").or(page.locator("text=Erro")).or(page.locator("text=demo")).count();
        const bodyText = await page.locator("body").innerText().catch(() => "");
        if (demoErr > 0) bad(`Demo não entrou — erro exibido: ${bodyText.slice(0, 150)}`);
        else {
          bad(`Demo não entrou — URL atual: ${page.url()}`);
          await page.screenshot({ path: "demo-fail.png", fullPage: true });
        }
      }
    }

    // 5. Se está no dashboard, testar navegação
    if (page.url().includes("/dashboard")) {
      ok("Dashboard acessível");

      const shellText = await page.locator("body").innerText().catch(() => "");
      if (/igreja|demo|pastor|painel|dashboard|visão|financeiro/i.test(shellText)) {
        ok("Dashboard renderizou conteúdo");
      } else {
        bad("Dashboard parece vazio");
      }

      // Navegar seções
      const sections = [
        ["/dashboard", "Início"],
        ["/dashboard/expenses", "Despesas"],
        ["/dashboard/members", "Membros"],
        ["/dashboard/events", "Eventos"],
        ["/dashboard/reports", "Relatórios"],
        ["/dashboard/team", "Equipe"],
        ["/dashboard/settings", "Configurações"],
        ["/dashboard/attendance", "Presenças"],
      ];
      for (const [path] of sections) {
        try {
          const resp = await page.goto(BASE + path, {
            waitUntil: "networkidle",
            timeout: 25000,
          });
          const status = resp?.status() ?? 0;
          const text = await page.locator("body").innerText().catch(() => "");
          const hasError =
            /Application error|unhandled|Something went wrong|500|TypeError|Cannot read/i.test(
              text
            );
          if (status === 200 && !hasError) {
            ok(`Rota autenticada ${path}`);
          } else if (status >= 300 && status < 400) {
            ok(`Rota ${path} → redirect HTTP ${status}`);
          } else {
            bad(`Rota ${path} HTTP ${status}${hasError ? " — erro na página" : ""}`);
            if (hasError) log.push(`    texto: ${text.slice(0, 120)}`);
          }
        } catch (e) {
          bad(`Rota ${path} — ${String(e).slice(0, 80)}`);
        }
      }

      // 6. Logout
      try {
        const logout = page.getByRole("button", { name: /sair|logout|sign out/i }).or(
          page.locator('form[action*="signOut"] button')
        );
        if (await logout.count()) {
          await logout.first().click();
          await page.waitForURL(/\/login/, { timeout: 15000 });
          ok("Logout redirecionou para /login");
        } else {
          // tentar link
          const link = page.locator('a[href="/login"], button:has-text("Sair")');
          if (await link.count()) {
            await link.first().click();
            await page.waitForTimeout(1500);
            ok("Tentativa de logout");
          } else {
            log.push("  ! Botão de logout não encontrado (não crítico)");
          }
        }
      } catch {
        log.push("  ! Logout não confirmado (não crítico)");
      }
    }

    // 7. Signup toggle
    await page.goto(BASE + "/login?mode=signup", { waitUntil: "networkidle", timeout: 20000 });
    const churchField = await page.locator('input[name="churchName"]').count();
    if (churchField) ok("Modo signup mostra campo da igreja");
    else bad("Modo signup sem campo da igreja");

    // 8. Forgot password
    await page.goto(BASE + "/login/forgot-password", {
      waitUntil: "networkidle",
      timeout: 20000,
    });
    const forgotEmail = await page.locator('input[name="email"]').count();
    if (forgotEmail) ok("Página forgot-password carregou");
    else bad("Página forgot-password sem input");

    // 9. Termos e privacidade
    for (const p of ["/termos", "/privacidade"]) {
      const r = await page.goto(BASE + p, { waitUntil: "networkidle", timeout: 20000 });
      if (r?.status() === 200) ok(`Página ${p} ok`);
      else bad(`Página ${p} HTTP ${r?.status()}`);
    }

    if (consoleErrors.length) {
      log.push(`  ! Console errors (${consoleErrors.length}):`);
      for (const e of consoleErrors.slice(0, 5)) log.push(`    - ${e}`);
    }
  } catch (e) {
    bad("Fluxo interrompido: " + String(e).slice(0, 200));
    await page.screenshot({ path: "ui-fail.png", fullPage: true }).catch(() => {});
  }

  await browser.close();
  console.log("=== UI SMOKE TEST ===");
  console.log(log.join("\n"));
  console.log(`\n=== RESULTADO UI: ${pass} ok, ${fail} falhas ===`);
  process.exit(fail > 0 ? 1 : 0);
}

main();
