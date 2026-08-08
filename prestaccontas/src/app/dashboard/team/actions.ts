"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
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

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autenticado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    throw new Error("Apenas administradores podem gerenciar usuários");
  }
}

export async function getTeamMembers() {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, role, created_at")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erro ao buscar membros:", error);
    return [];
  }

  return data || [];
}

export async function getTenantInfo() {
  const supabase = await createClient();
  const tenantId = await getTenantId();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("name")
    .eq("id", tenantId)
    .single();

  return tenant?.name || "Igreja";
}

export async function inviteUser(prevState: string | null, formData: FormData) {
  try {
    await requireAdmin();
  } catch {
    return "Apenas administradores podem convidar usuários";
  }

  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const role = formData.get("role") as string;

  if (!email || !name || !role) {
    return "Preencha todos os campos";
  }

  if (!["admin", "editor", "viewer"].includes(role)) {
    return "Papel inválido";
  }

  const tenantId = await getTenantId();
  const admin = createAdminClient();
  const supabase = await createClient();

  // Gerar senha temporária válida (mínimo 8 caracteres, maiúscula, minúscula, número)
  const generatePassword = () => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const special = "!@#$%";
    const all = upper + lower + numbers;

    // Garantir pelo menos 1 de cada tipo
    let password = "";
    password += upper[Math.floor(Math.random() * upper.length)];
    password += lower[Math.floor(Math.random() * lower.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Preencher o resto aleatoriamente
    for (let i = 0; i < 8; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }

    // Embaralhar a senha
    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  };

  const tempPassword = generatePassword();

  console.log("=== CRIANDO CONVITE ===");
  console.log("Email:", email);
  console.log("Senha gerada:", tempPassword);
  console.log("Tamanho da senha:", tempPassword.length);

  // Verificar se o email já existe
  const { data: existingUsers } = await admin.auth.admin.listUsers();
  const userExists = existingUsers?.users?.some(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );

  if (userExists) {
    return "Este email já está cadastrado no sistema";
  }

  // Criar usuário no Auth
  const { data: authData, error: authError } =
    await admin.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        name: name.trim(),
      },
    });

  if (authError) {
    console.error("Erro ao criar usuário:", authError);
    return `Erro ao criar usuário: ${authError.message}`;
  }

  if (!authData.user) {
    return "Erro ao criar usuário. Nenhum dado retornado.";
  }

  console.log("Usuário criado com ID:", authData.user.id);

  // Criar profile
  const { error: profileError } = await admin.from("profiles").insert({
    id: authData.user.id,
    tenant_id: tenantId,
    name: name.trim(),
    role,
  });

  if (profileError) {
    console.error("Erro ao criar profile:", profileError);
    // Tentar deletar o usuário criado se o profile falhar
    await admin.auth.admin.deleteUser(authData.user.id);
    return `Erro ao criar perfil: ${profileError.message}`;
  }

  console.log("Profile criado com sucesso");

  // Verificar se o login funciona
  const { error: testLoginError } = await admin.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password: tempPassword,
  });

  if (testLoginError) {
    console.error("Erro no teste de login:", testLoginError);
  } else {
    console.log("Teste de login bem-sucedido!");
    // Fazer logout após o teste
    await admin.auth.signOut();
  }

  // Buscar nome da igreja
  const { data: tenant } = await supabase
    .from("tenants")
    .select("name")
    .eq("id", tenantId)
    .single();

  const churchName = tenant?.name || "Igreja";

  revalidatePath("/dashboard/team");

  // Retornar credenciais para o admin compartilhar
  return `SUCCESS:${JSON.stringify({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: tempPassword,
    role,
    churchName,
  })}`;
}

export async function updateUserRole(userId: string, newRole: string) {
  try {
    await requireAdmin();
  } catch {
    return "Apenas administradores podem alterar papéis";
  }

  if (!["admin", "editor", "viewer"].includes(newRole)) {
    return "Papel inválido";
  }

  const tenantId = await getTenantId();
  const supabase = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.id === userId) {
    return "Você não pode alterar seu próprio papel";
  }

  const { error } = await admin
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId)
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("Erro ao atualizar papel:", error);
    return "Erro ao atualizar papel do usuário.";
  }

  revalidatePath("/dashboard/team");
  return null;
}

export async function removeUser(userId: string) {
  try {
    await requireAdmin();
  } catch {
    return "Apenas administradores podem remover usuários";
  }

  const tenantId = await getTenantId();
  const supabase = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.id === userId) {
    return "Você não pode remover sua própria conta";
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .eq("tenant_id", tenantId)
    .single();

  if (profile?.role === "admin") {
    const { count } = await admin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("role", "admin");

    if (count && count <= 1) {
      return "Não é possível remover o último administrador";
    }
  }

  const { error } = await admin
    .from("profiles")
    .delete()
    .eq("id", userId)
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("Erro ao remover usuário:", error);
    return "Erro ao remover usuário.";
  }

  revalidatePath("/dashboard/team");
  return null;
}
