-- Migration: Row Level Security (RLS) Policies
-- Created: 2026-08-02

-- ============================================
-- HELPER FUNCTION: Get current user's tenant_id
-- ============================================
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TENANTS POLICIES
-- ============================================
-- Usuários só veem o próprio tenant
CREATE POLICY "Users can view own tenant"
  ON tenants FOR SELECT
  USING (id = get_user_tenant_id());

-- Apenas admins podem atualizar o tenant
CREATE POLICY "Admins can update own tenant"
  ON tenants FOR UPDATE
  USING (
    id = get_user_tenant_id()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- ============================================
-- PROFILES POLICIES
-- ============================================
-- Usuários veem perfis do mesmo tenant
CREATE POLICY "Users can view profiles in same tenant"
  ON profiles FOR SELECT
  USING (tenant_id = get_user_tenant_id());

-- Usuários podem atualizar próprio perfil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- ============================================
-- ENTRIES POLICIES
-- ============================================
CREATE POLICY "Users can view entries from own tenant"
  ON entries FOR SELECT
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can insert entries in own tenant"
  ON entries FOR INSERT
  WITH CHECK (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can update entries in own tenant"
  ON entries FOR UPDATE
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can delete entries in own tenant"
  ON entries FOR DELETE
  USING (tenant_id = get_user_tenant_id());

-- ============================================
-- EXPENSES POLICIES
-- ============================================
CREATE POLICY "Users can view expenses from own tenant"
  ON expenses FOR SELECT
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can insert expenses in own tenant"
  ON expenses FOR INSERT
  WITH CHECK (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can update expenses in own tenant"
  ON expenses FOR UPDATE
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can delete expenses in own tenant"
  ON expenses FOR DELETE
  USING (tenant_id = get_user_tenant_id());
