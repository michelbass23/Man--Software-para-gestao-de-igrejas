-- Migration: Initial Schema for PrestaContas Multi-Tenant
-- Created: 2026-08-02

-- ============================================
-- TENANTS (Igrejas)
-- ============================================
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'trialing')),
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- PROFILES (Usuários vinculados ao auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'editor', 'viewer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- ENTRIES (Dízimos, Ofertas, Doações, etc.)
-- ============================================
CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL CHECK (category IN (
    'dizimo', 'oferta', 'doacao', 'campanha', 'evento', 'outros_entradas'
  )),
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  description TEXT,
  person_name TEXT,
  receipt_url TEXT,
  recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- EXPENSES (Despesas operacionais)
-- ============================================
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL CHECK (category IN (
    'aluguel', 'energia', 'agua', 'internet', 'manutencao',
    'salarios', 'missoes', 'eventos', 'material', 'transporte',
    'seguro', 'impostos', 'outros_despesas'
  )),
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  description TEXT,
  person_name TEXT,
  receipt_url TEXT,
  recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_profiles_tenant ON profiles(tenant_id);
CREATE INDEX idx_entries_tenant_date ON entries(tenant_id, date DESC);
CREATE INDEX idx_expenses_tenant_date ON expenses(tenant_id, date DESC);
CREATE INDEX idx_entries_category ON entries(tenant_id, category);
CREATE INDEX idx_expenses_category ON expenses(tenant_id, category);
