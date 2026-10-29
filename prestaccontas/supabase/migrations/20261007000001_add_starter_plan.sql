-- Migration: Add 'starter' plan tier + pending_plan tracking
-- Created: 2026-10-07

ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_plan_check;
ALTER TABLE tenants ADD CONSTRAINT tenants_plan_check
  CHECK (plan IN ('free', 'starter', 'pro', 'enterprise'));

-- Plano escolhido no checkout, antes do webhook confirmar o pagamento.
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS pending_plan TEXT;
