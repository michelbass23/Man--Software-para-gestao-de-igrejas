"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function signIn(prevState: string | null, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return "Preencha todos os campos";
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Erro ao fazer login:", error);
    const msg = error.message?.toLowerCase() || "";
    if (
      error.name === "AuthRetryableFetchError" ||
      msg.includes("fetch") ||
      msg.includes("network") ||
      msg.includes("failed to fetch")
    ) {
      return "Não foi possível conectar ao servidor de autenticação. Verifique sua internet ou tente novamente em instantes.";
    }
    if (msg.includes("invalid login credentials") || msg.includes("invalid")) {
      return "Email ou senha incorretos";
    }
    if (msg.includes("email not confirmed") || msg.includes("confirm")) {
      return "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.";
    }
    return "Email ou senha incorretos";
  }

  // Verificar se tem profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, tenant_id")
    .eq("id", data.user.id)
    .single();

  if (!profile) {
    // Usuário autenticado mas sem profile, ir para setup
    redirect("/setup");
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUp(
  prevState: string | null,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const churchName = formData.get("churchName") as string;
  const redirectTo = (formData.get("redirect") as string) || "/dashboard";

  if (!email || !password || !churchName) {
    return "Preencha todos os campos";
  }

  if (password.length < 6) {
    return "A senha deve ter pelo menos 6 caracteres";
  }

  // Usar admin client para cadastro (bypass RLS)
  const admin = createAdminClient();

  // Criar usuário no Auth
  const { data: authData, error: authError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError) {
    console.error("Erro ao criar usuário:", authError);
    if (authError.message.includes("already")) {
      return "Este email já está cadastrado";
    }
    return `Erro ao criar conta: ${authError.message}`;
  }

  if (!authData.user) {
    return "Erro ao criar conta. Tente novamente.";
  }

  // Criar tenant (igreja)
  const slug = churchName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const { data: tenant, error: tenantError } = await admin
    .from("tenants")
    .insert({
      name: churchName,
      slug: `${slug}-${Date.now().toString(36)}`,
    })
    .select()
    .single();

  if (tenantError) {
    console.error("Erro ao criar tenant:", tenantError);
    return `Erro ao criar igreja: ${tenantError.message}`;
  }

  // Criar profile vinculado ao tenant
  const { error: profileError } = await admin.from("profiles").insert({
    id: authData.user.id,
    tenant_id: tenant.id,
    name: email.split("@")[0],
    role: "admin",
  });

  if (profileError) {
    console.error("Erro ao criar profile:", profileError);
    return `Erro ao criar perfil: ${profileError.message}`;
  }

  // Fazer login automaticamente após cadastro
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    console.error("Erro ao fazer login após cadastro:", signInError);
    redirect("/login");
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  const admin = createAdminClient();

  // Verificar se é usuário demo e limpar dados
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email === "demo@prestaccontas.com") {
    // Buscar tenant do demo
    const { data: profile } = await admin
      .from("profiles")
      .select("tenant_id")
      .eq("id", user.id)
      .single();

    if (profile) {
      // Deletar tenant (cascade deleta tudo)
      await admin.from("tenants").delete().eq("id", profile.tenant_id);
    }

    // Deletar usuário demo
    await admin.auth.admin.deleteUser(user.id);
  }

  await supabase.auth.signOut();
  redirect("/login");
}

export async function forgotPassword(
  prevState: string | null,
  formData: FormData
) {
  const email = formData.get("email") as string;

  if (!email) {
    return "Informe seu e-mail";
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/login/reset-password`,
  });

  if (error) {
    console.error("Erro ao enviar email de recuperação:", error);
    return "Não foi possível enviar o e-mail. Tente novamente.";
  }

  // Sucesso: retorna mensagem especial que a página interpreta
  return "EMAIL_SENT";
}

export async function updatePassword(
  prevState: string | null,
  formData: FormData
) {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return "Preencha todos os campos";
  }

  if (password.length < 6) {
    return "A senha deve ter pelo menos 6 caracteres";
  }

  if (password !== confirmPassword) {
    return "As senhas não coincidem";
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.error("Erro ao atualizar senha:", error);
    if (error.message.includes("same")) {
      return "A nova senha deve ser diferente da atual";
    }
    return "Não foi possível atualizar a senha. O link pode ter expirado — solicite um novo.";
  }

  redirect("/dashboard");
}
