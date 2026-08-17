-- Migration: Add subscription fields for Mercado Pago integration
-- Created: 2026-08-17

-- Adicionar campos de assinatura na tabela tenants
ALTER TABLE tenants
ADD COLUMN mercado_pago_preapproval_id TEXT,
ADD COLUMN subscription_started_at TIMESTAMPTZ,
ADD COLUMN subscription_next_payment DATE;

-- Índice para buscar por preapproval_id (webhook)
CREATE INDEX idx_tenants_mp_preapproval ON tenants(mercado_pago_preapproval_id);
