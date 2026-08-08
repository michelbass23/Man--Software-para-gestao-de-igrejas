// Script para testar a criação de usuário
// Execute com: npx tsx test-invite.ts

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Variáveis de ambiente não configuradas");
  process.exit(1);
}

const admin = createClient(supabaseUrl, supabaseServiceKey);

async function testInvite() {
  const testEmail = "teste@exemplo.com";
  const testPassword = "Teste123!";

  console.log("Testando criação de usuário...");
  console.log("Email:", testEmail);
  console.log("Senha:", testPassword);

  // Criar usuário
  const { data, error } = await admin.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
  });

  if (error) {
    console.error("Erro ao criar usuário:", error.message);
    return;
  }

  console.log("Usuário criado com sucesso!");
  console.log("ID:", data.user?.id);

  // Testar login
  console.log("\nTestando login...");
  const { data: signInData, error: signInError } =
    await admin.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

  if (signInError) {
    console.error("Erro ao fazer login:", signInError.message);
  } else {
    console.log("Login bem-sucedido!");
    console.log("User ID:", signInData.user?.id);
  }

  // Limpar - deletar usuário de teste
  if (data.user?.id) {
    console.log("\nLimpando usuário de teste...");
    await admin.auth.admin.deleteUser(data.user.id);
    console.log("Usuário deletado");
  }
}

testInvite().catch(console.error);
