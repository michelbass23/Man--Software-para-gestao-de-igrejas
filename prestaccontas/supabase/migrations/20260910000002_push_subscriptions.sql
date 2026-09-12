-- Migration: Web Push
-- Created: 2026-09-10
--
-- Guarda as inscrições de push por usuário/dispositivo (o browser gera um
-- endpoint único por dispositivo ao se inscrever). Enviar notificação =
-- iterar as inscrições do tenant e mandar via web-push (VAPID) no servidor.

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_tenant ON push_subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own push subscriptions"
  ON push_subscriptions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own push subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (user_id = auth.uid() AND tenant_id = get_user_tenant_id());

-- Necessária pro upsert (savePushSubscription) — reinscrever o mesmo
-- endpoint (conflito na constraint UNIQUE) faz um UPDATE por baixo.
CREATE POLICY "Users can update own push subscriptions"
  ON push_subscriptions FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND tenant_id = get_user_tenant_id());

CREATE POLICY "Users can delete own push subscriptions"
  ON push_subscriptions FOR DELETE
  USING (user_id = auth.uid());

-- Alertas de despesa fixa (fixed_expenses_alerts.sql) só eram gerados sob
-- demanda, quando alguém abria o dropdown de alertas. Sem isso, o cron de
-- notificação (api/cron/notify-expenses) não teria como saber o que já foi
-- enviado antes — usa a própria tabela alerts como registro de dedupe.
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS push_sent_at TIMESTAMPTZ;
