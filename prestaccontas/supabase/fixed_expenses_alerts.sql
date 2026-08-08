-- Adicionar colunas para despesas fixas e alertas
-- Cole este script no SQL Editor do Supabase

-- Colunas para despesas fixas na tabela expenses
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_fixed BOOLEAN DEFAULT false;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS due_day INTEGER CHECK (due_day >= 1 AND due_day <= 31);
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS next_due_date DATE;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue'));

-- Tabela de alertas/notificações
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('due_soon', 'overdue', 'custom')),
  title TEXT NOT NULL,
  message TEXT,
  due_date DATE NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para alertas
CREATE INDEX IF NOT EXISTS idx_alerts_tenant ON alerts(tenant_id, is_read);
CREATE INDEX IF NOT EXISTS idx_alerts_due_date ON alerts(due_date);

-- RLS para alertas
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view alerts from own tenant" ON alerts
  FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can insert alerts in own tenant" ON alerts
  FOR INSERT WITH CHECK (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can update alerts in own tenant" ON alerts
  FOR UPDATE USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can delete alerts in own tenant" ON alerts
  FOR DELETE USING (tenant_id = get_user_tenant_id());

-- Função para gerar alertas automaticamente
CREATE OR REPLACE FUNCTION generate_expense_alerts()
RETURNS void AS $$
BEGIN
  -- Alertas para despesas vencendo em 3 dias
  INSERT INTO alerts (tenant_id, expense_id, type, title, message, due_date)
  SELECT 
    e.tenant_id,
    e.id,
    'due_soon',
    'Despesa vencendo em breve',
    e.description || ' - Vence em ' || e.next_due_date::text,
    e.next_due_date
  FROM expenses e
  WHERE e.is_fixed = true
    AND e.status = 'pending'
    AND e.next_due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'
    AND NOT EXISTS (
      SELECT 1 FROM alerts a 
      WHERE a.expense_id = e.id 
        AND a.type = 'due_soon' 
        AND a.due_date = e.next_due_date
    );

  -- Alertas para despesas vencidas
  INSERT INTO alerts (tenant_id, expense_id, type, title, message, due_date)
  SELECT 
    e.tenant_id,
    e.id,
    'overdue',
    'Despesa vencida!',
    e.description || ' - Venceu em ' || e.next_due_date::text,
    e.next_due_date
  FROM expenses e
  WHERE e.is_fixed = true
    AND e.status = 'pending'
    AND e.next_due_date < CURRENT_DATE
    AND NOT EXISTS (
      SELECT 1 FROM alerts a 
      WHERE a.expense_id = e.id 
        AND a.type = 'overdue' 
        AND a.due_date = e.next_due_date
    );
END;
$$ LANGUAGE plpgsql;
