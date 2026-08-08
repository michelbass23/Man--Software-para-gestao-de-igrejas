-- ============================================================
-- PrestaContas - Schema Multi-Tenant para Supabase
-- Sistema de Prestação de Contas Simplificada para Igrejas
-- ============================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. TABELA TENANTS (Igrejas)
-- ============================================================
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'trialing')),
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para tenants
CREATE INDEX idx_tenants_slug ON public.tenants(slug);
CREATE INDEX idx_tenants_status ON public.tenants(status);

-- ============================================================
-- 2. TABELA USERS (Líderes/Tesoureiros)
-- ============================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para profiles
CREATE INDEX idx_profiles_tenant_id ON public.profiles(tenant_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- ============================================================
-- 3. ENUM PARA CATEGORIAS
-- ============================================================
CREATE TYPE entry_category AS ENUM (
    'dizimo',
    'oferta',
    'doacao',
    'campanha',
    'evento',
    'outros_entradas'
);

CREATE TYPE expense_category AS ENUM (
    'aluguel',
    'energia',
    'agua',
    'internet',
    'manutencao',
    'salarios',
    'missoes',
    'eventos',
    'material',
    'transporte',
    'seguro',
    'impostos',
    'outros_despesas'
);

-- ============================================================
-- 4. TABELA ENTRIES (Dízimos e Ofertas)
-- ============================================================
CREATE TABLE public.entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category entry_category NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    description TEXT,
    recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para entries
CREATE INDEX idx_entries_tenant_id ON public.entries(tenant_id);
CREATE INDEX idx_entries_date ON public.entries(date);
CREATE INDEX idx_entries_category ON public.entries(category);
CREATE INDEX idx_entries_tenant_date ON public.entries(tenant_id, date);

-- ============================================================
-- 5. TABELA EXPENSES (Despesas)
-- ============================================================
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category expense_category NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    description TEXT,
    recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para expenses
CREATE INDEX idx_expenses_tenant_id ON public.expenses(tenant_id);
CREATE INDEX idx_expenses_date ON public.expenses(date);
CREATE INDEX idx_expenses_category ON public.expenses(category);
CREATE INDEX idx_expenses_tenant_date ON public.expenses(tenant_id, date);

-- ============================================================
-- 6. ROW LEVEL SECURITY (RLS) - Isolamento Multi-Tenant
-- ============================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLICIES: Função helper para obter o tenant do usuário atual
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID AS $$
    SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- POLICIES: Tenants
-- ============================================================
CREATE POLICY "Users can view their own tenant"
    ON public.tenants FOR SELECT
    USING (id = public.get_user_tenant_id());

CREATE POLICY "Admins can update their tenant"
    ON public.tenants FOR UPDATE
    USING (
        id = public.get_user_tenant_id()
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================
-- POLICIES: Profiles
-- ============================================================
CREATE POLICY "Users can view profiles in their tenant"
    ON public.profiles FOR SELECT
    USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can insert profiles in their tenant"
    ON public.profiles FOR INSERT
    WITH CHECK (
        tenant_id = public.get_user_tenant_id()
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update profiles in their tenant"
    ON public.profiles FOR UPDATE
    USING (
        tenant_id = public.get_user_tenant_id()
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid());

-- ============================================================
-- POLICIES: Entries (Dízimos e Ofertas)
-- ============================================================
CREATE POLICY "Users can view entries in their tenant"
    ON public.entries FOR SELECT
    USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Editors can insert entries in their tenant"
    ON public.entries FOR INSERT
    WITH CHECK (
        tenant_id = public.get_user_tenant_id()
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Editors can update entries in their tenant"
    ON public.entries FOR UPDATE
    USING (
        tenant_id = public.get_user_tenant_id()
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Admins can delete entries in their tenant"
    ON public.entries FOR DELETE
    USING (
        tenant_id = public.get_user_tenant_id()
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================
-- POLICIES: Expenses (Despesas)
-- ============================================================
CREATE POLICY "Users can view expenses in their tenant"
    ON public.expenses FOR SELECT
    USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Editors can insert expenses in their tenant"
    ON public.expenses FOR INSERT
    WITH CHECK (
        tenant_id = public.get_user_tenant_id()
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Editors can update expenses in their tenant"
    ON public.expenses FOR UPDATE
    USING (
        tenant_id = public.get_user_tenant_id()
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Admins can delete expenses in their tenant"
    ON public.expenses FOR DELETE
    USING (
        tenant_id = public.get_user_tenant_id()
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================
-- 7. FUNÇÕES AUXILIARES
-- ============================================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER set_updated_at_tenants
    BEFORE UPDATE ON public.tenants
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at_entries
    BEFORE UPDATE ON public.entries
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at_expenses
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 8. FUNÇÃO: Criar perfil automaticamente ao registrar usuário
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- O perfil deve ser criado via Edge Function ou trigger
    -- após o cadastro no Auth, passando o tenant_id correto
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 9. VIEWS ÚTEIS PARA DASHBOARD
-- ============================================================

-- View: Resumo financeiro mensal por tenant
CREATE OR REPLACE VIEW public.monthly_summary AS
SELECT
    tenant_id,
    DATE_TRUNC('month', date) AS month,
    SUM(CASE WHEN 'entries' THEN amount ELSE 0 END) AS total_entries,
    SUM(CASE WHEN 'expenses' THEN amount ELSE 0 END) AS total_expenses,
    SUM(CASE WHEN 'entries' THEN amount ELSE 0 END) -
    SUM(CASE WHEN 'expenses' THEN amount ELSE 0 END) AS net_balance
FROM (
    SELECT tenant_id, date, amount, 'entries' AS type FROM public.entries
    UNION ALL
    SELECT tenant_id, date, amount, 'expenses' AS type FROM public.expenses
) combined
GROUP BY tenant_id, DATE_TRUNC('month', date);

-- View: Entradas por categoria
CREATE OR REPLACE VIEW public.entries_by_category AS
SELECT
    tenant_id,
    DATE_TRUNC('month', date) AS month,
    category,
    SUM(amount) AS total,
    COUNT(*) AS count
FROM public.entries
GROUP BY tenant_id, DATE_TRUNC('month', date), category;

-- View: Despesas por categoria
CREATE OR REPLACE VIEW public.expenses_by_category AS
SELECT
    tenant_id,
    DATE_TRUNC('month', date) AS month,
    category,
    SUM(amount) AS total,
    COUNT(*) AS count
FROM public.expenses
GROUP BY tenant_id, DATE_TRUNC('month', date), category;

-- ============================================================
-- 10. DADOS DE EXEMPLO (OPCIONAL - para desenvolvimento)
-- ============================================================

-- Inserir tenant de exemplo
-- INSERT INTO public.tenants (name, slug, status, plan)
-- VALUES ('Igreja Batista Central', 'igreja-batista-central', 'active', 'pro');

-- ============================================================
-- FIM DO SCHEMA
-- ============================================================
