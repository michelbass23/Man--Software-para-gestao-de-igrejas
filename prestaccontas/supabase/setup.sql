-- ============================================
-- PRESTACCONTAS - Setup Completo
-- Cole este script inteiro no SQL Editor do Supabase
-- ============================================

-- ============================================
-- 1. SCHEMA - Tabelas
-- ============================================

-- Tenants (Igrejas)
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'trialing')),
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles (Usuários vinculados ao auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'editor', 'viewer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Entries (Dízimos, Ofertas, Doações, etc.)
CREATE TABLE IF NOT EXISTS entries (
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

-- Expenses (Despesas operacionais)
CREATE TABLE IF NOT EXISTS expenses (
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

-- Índices
CREATE INDEX IF NOT EXISTS idx_profiles_tenant ON profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_entries_tenant_date ON entries(tenant_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_tenant_date ON expenses(tenant_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_entries_category ON entries(tenant_id, category);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(tenant_id, category);

-- ============================================
-- 2. TRIGGETS - updated_at automático
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_tenants
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_entries
  BEFORE UPDATE ON entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_expenses
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. RLS - Row Level Security (Multi-tenant)
-- ============================================

-- Helper: buscar tenant_id do usuário atual
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Habilitar RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- TENANTS: usuários só veem o próprio
CREATE POLICY "Users can view own tenant" ON tenants
  FOR SELECT USING (id = get_user_tenant_id());

CREATE POLICY "Admins can update own tenant" ON tenants
  FOR UPDATE USING (
    id = get_user_tenant_id()
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- PROFILES: ver perfis do mesmo tenant
CREATE POLICY "Users can view profiles in same tenant" ON profiles
  FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- PROFILES: admins podem inserir e deletar perfis do mesmo tenant
CREATE POLICY "Admins can insert profiles in own tenant" ON profiles
  FOR INSERT WITH CHECK (
    tenant_id = get_user_tenant_id()
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete profiles in own tenant" ON profiles
  FOR DELETE USING (
    tenant_id = get_user_tenant_id()
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ENTRIES: CRUD do próprio tenant
CREATE POLICY "Users can view entries from own tenant" ON entries
  FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can insert entries in own tenant" ON entries
  FOR INSERT WITH CHECK (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can update entries in own tenant" ON entries
  FOR UPDATE USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can delete entries in own tenant" ON entries
  FOR DELETE USING (tenant_id = get_user_tenant_id());

-- EXPENSES: CRUD do próprio tenant
CREATE POLICY "Users can view expenses from own tenant" ON expenses
  FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can insert expenses in own tenant" ON expenses
  FOR INSERT WITH CHECK (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can update expenses in own tenant" ON expenses
  FOR UPDATE USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can delete expenses in own tenant" ON expenses
  FOR DELETE USING (tenant_id = get_user_tenant_id());
