-- Migration: Add subscription fields for Asaas integration
-- Created: 2026-09-04

-- Campos de assinatura via Asaas na tabela tenants
ALTER TABLE tenants
ADD COLUMN asaas_customer_id TEXT,
ADD COLUMN asaas_subscription_id TEXT,
ADD COLUMN cpf_cnpj TEXT;

-- Índice para localizar o tenant a partir do webhook (subscription -> tenant)
CREATE INDEX idx_tenants_asaas_subscription ON tenants(asaas_subscription_id);
