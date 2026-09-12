import { createClient } from "@/lib/supabase/server";

/**
 * Espelha a checagem que o banco já faz (função user_can_edit() nas
 * policies de RLS) para devolver uma mensagem amigável antes de bater
 * no erro do Postgres. Lança erro se o usuário não for admin/editor.
 */
export async function requireEditor(): Promise<void> {
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

  if (!profile || !["admin", "editor"].includes(profile.role)) {
    throw new Error("Seu perfil (visualizador) não tem permissão para fazer alterações.");
  }
}
