-- Migration: Add Members table
-- Created: 2026-08-04

-- ============================================
-- MEMBERS (Cadastro de Membros)
-- ============================================
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  photo_url TEXT,
  phone TEXT,
  email TEXT,
  birth_date DATE,
  baptism_date DATE,
  marital_status TEXT CHECK (marital_status IN ('solteiro', 'casado', 'viuvo', 'divorciado', 'outro')),
  ministry TEXT,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'visitante')),
  notes TEXT,
  recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_members_tenant ON members(tenant_id);
CREATE INDEX idx_members_tenant_name ON members(tenant_id, name);
CREATE INDEX idx_members_tenant_status ON members(tenant_id, status);

-- RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view members from own tenant"
  ON members FOR SELECT
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can insert members in own tenant"
  ON members FOR INSERT
  WITH CHECK (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can update members in own tenant"
  ON members FOR UPDATE
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can delete members from own tenant"
  ON members FOR DELETE
  USING (tenant_id = get_user_tenant_id());

-- Trigger updated_at
CREATE TRIGGER set_updated_at_members
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
