-- Migration: Add PIX configuration to tenants
-- Created: 2026-09-11

ALTER TABLE tenants
  ADD COLUMN pix_key TEXT,
  ADD COLUMN pix_key_type TEXT CHECK (pix_key_type IN ('cpf', 'cnpj', 'email', 'phone', 'random'));