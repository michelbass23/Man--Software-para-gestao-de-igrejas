-- Migration: Log de auditoria (quem criou/editou/apagou o quê)
-- Created: 2026-09-04

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT,
  action TEXT NOT NULL, -- 'create' | 'update' | 'delete'
  entity_type TEXT NOT NULL, -- 'entry' | 'expense' | 'member' | 'event' | 'team_member'
  entity_id TEXT,
  entity_label TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_tenant_created ON audit_logs(tenant_id, created_at DESC);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário do tenant pode registrar uma ação (editor/admin fazem deletes)
CREATE POLICY "Users can insert audit logs in own tenant"
  ON audit_logs FOR INSERT
  WITH CHECK (tenant_id = get_user_tenant_id());

-- Apenas admins podem ver o histórico de auditoria
CREATE POLICY "Admins can view audit logs from own tenant"
  ON audit_logs FOR SELECT
  USING (
    tenant_id = get_user_tenant_id()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
