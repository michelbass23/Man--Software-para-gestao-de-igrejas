-- Migration: Add Events table (Agenda de Eventos)
-- Created: 2026-08-06

-- ============================================
-- EVENTS (Agenda de Eventos)
-- ============================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'culto', 'show', 'encontro', 'conferencia', 'workshop',
    'retiro', 'batismo', 'ceia', 'culto_jovens', 'culto_criancas', 'outro'
  )),
  event_date DATE NOT NULL,
  event_time TIME,
  location TEXT,
  banner_url TEXT,
  responsible_name TEXT,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'cancelado', 'concluido')),
  recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_events_tenant ON events(tenant_id);
CREATE INDEX idx_events_tenant_date ON events(tenant_id, event_date DESC);
CREATE INDEX idx_events_tenant_status ON events(tenant_id, status);

-- RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view events from own tenant"
  ON events FOR SELECT
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can insert events in own tenant"
  ON events FOR INSERT
  WITH CHECK (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can update events in own tenant"
  ON events FOR UPDATE
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can delete events from own tenant"
  ON events FOR DELETE
  USING (tenant_id = get_user_tenant_id());

-- Trigger updated_at
CREATE TRIGGER set_updated_at_events
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
