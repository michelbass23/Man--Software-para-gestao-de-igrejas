-- Migration: Controle de inadimplência (carência antes de bloquear acesso)
-- Created: 2026-09-06

ALTER TABLE tenants
ADD COLUMN subscription_overdue_since TIMESTAMPTZ;

ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_status_check;
ALTER TABLE tenants ADD CONSTRAINT tenants_status_check
  CHECK (status IN ('active', 'inactive', 'trialing', 'overdue'));
