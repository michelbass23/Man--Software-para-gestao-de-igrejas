-- Migration: Add Attendance system for events
-- Created: 2026-08-08

-- ============================================
-- ATTENDANCE TOKENS (Tokens de check-in por evento)
-- ============================================
CREATE TABLE attendance_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- ATTENDANCE (Presenças registradas)
-- ============================================
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  token_id UUID REFERENCES attendance_tokens(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  age INTEGER,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'visitante' CHECK (status IN ('membro', 'visitante')),
  device_fingerprint TEXT,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_attendance_tokens_event ON attendance_tokens(event_id);
CREATE INDEX idx_attendance_tokens_token ON attendance_tokens(token);
CREATE INDEX idx_attendance_event ON attendance(event_id);
CREATE INDEX idx_attendance_tenant ON attendance(tenant_id);

-- RLS
ALTER TABLE attendance_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Policies para attendance_tokens (admin only via service role)
CREATE POLICY "Users can view attendance tokens from own tenant"
  ON attendance_tokens FOR SELECT
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can insert attendance tokens in own tenant"
  ON attendance_tokens FOR INSERT
  WITH CHECK (tenant_id = get_user_tenant_id());

-- Policies para attendance (admin via service role, insert via public)
CREATE POLICY "Users can view attendance from own tenant"
  ON attendance FOR SELECT
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Anyone can insert attendance"
  ON attendance FOR INSERT
  WITH CHECK (true);

-- Trigger updated_at
CREATE TRIGGER set_updated_at_attendance_tokens
  BEFORE UPDATE ON attendance_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
