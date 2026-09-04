-- Migration: Log de eventos de webhook (Asaas) para diagnostico
-- Created: 2026-09-04

CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'asaas',
  event TEXT,
  subscription_id TEXT,
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  status TEXT NOT NULL, -- 'processed' | 'ignored' | 'error'
  error_message TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_webhook_logs_created_at ON webhook_logs(created_at DESC);
CREATE INDEX idx_webhook_logs_status ON webhook_logs(status);
