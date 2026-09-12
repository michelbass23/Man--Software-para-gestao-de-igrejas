"use server";

import { createClient } from "@/lib/supabase/server";
import { sendPushToUser } from "@/lib/push";

async function getUserAndTenant() {
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

  return { supabase, userId: user.id, tenantId: profile.tenant_id };
}

export async function savePushSubscription(subscription: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}) {
  try {
    const { supabase, userId, tenantId } = await getUserAndTenant();

    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        tenant_id: tenantId,
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      { onConflict: "endpoint" }
    );

    if (error) {
      console.error("Erro ao salvar inscrição push:", error);
      return { error: "Erro ao ativar notificações" };
    }

    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao ativar notificações" };
  }
}

export async function removePushSubscription(endpoint: string) {
  try {
    const { supabase, userId } = await getUserAndTenant();

    const { error } = await supabase
      .from("push_subscriptions")
      .delete()
      .eq("endpoint", endpoint)
      .eq("user_id", userId);

    if (error) {
      console.error("Erro ao remover inscrição push:", error);
      return { error: "Erro ao desativar notificações" };
    }

    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao desativar notificações" };
  }
}

export async function hasPushSubscription(endpoint: string): Promise<boolean> {
  try {
    const { supabase, userId } = await getUserAndTenant();
    const { data } = await supabase
      .from("push_subscriptions")
      .select("id")
      .eq("endpoint", endpoint)
      .eq("user_id", userId)
      .maybeSingle();
    return !!data;
  } catch {
    return false;
  }
}

export async function sendTestPush() {
  try {
    const { userId } = await getUserAndTenant();
    const result = await sendPushToUser(userId, {
      title: "Notificações ativadas!",
      body: "Você vai receber avisos de despesas vencendo por aqui.",
      tag: "test",
    });

    if (result.sent === 0) {
      return { error: "Nenhum dispositivo inscrito encontrado" };
    }

    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao enviar teste" };
  }
}
