-- Migration: Correções de segurança em RLS
-- Created: 2026-09-10
--
-- 1) Impede que um usuário altere o próprio "role" direto pelo client
--    (hoje a policy de UPDATE em profiles só checa id = auth.uid(), sem
--    restringir colunas — qualquer usuário autenticado podia se promover
--    a admin chamando supabase.from('profiles').update({role:'admin'}) na mão).
-- 2) Passa a exigir role admin/editor para inserir/editar/apagar em
--    entries, expenses, members e events (hoje qualquer membro do tenant,
--    inclusive "viewer", conseguia escrever direto pela API mesmo que a
--    interface não ofereça o botão).
-- 3) Fecha o INSERT público e irrestrito em attendance (WITH CHECK true),
--    exigindo que o evento referenciado realmente exista, seja do mesmo
--    tenant e não esteja cancelado.

-- ============================================
-- 1) Anti-escalonamento de privilégio em profiles
-- ============================================
CREATE OR REPLACE FUNCTION prevent_role_self_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- service_role (usado pelas server actions após checar requireAdmin())
  -- continua podendo alterar o role normalmente.
  IF NEW.role IS DISTINCT FROM OLD.role AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Alteração de papel deve ser feita por um administrador.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_role_self_escalation ON profiles;
CREATE TRIGGER trg_prevent_role_self_escalation
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION prevent_role_self_escalation();

-- ============================================
-- 2) Checagem de papel (admin/editor) para escrita
-- ============================================
CREATE OR REPLACE FUNCTION user_can_edit()
RETURNS BOOLEAN AS $$
  SELECT role IN ('admin', 'editor') FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Entries
DROP POLICY IF EXISTS "Users can insert entries in own tenant" ON entries;
CREATE POLICY "Users can insert entries in own tenant"
  ON entries FOR INSERT
  WITH CHECK (tenant_id = get_user_tenant_id() AND user_can_edit());

DROP POLICY IF EXISTS "Users can update entries in own tenant" ON entries;
CREATE POLICY "Users can update entries in own tenant"
  ON entries FOR UPDATE
  USING (tenant_id = get_user_tenant_id() AND user_can_edit());

DROP POLICY IF EXISTS "Users can delete entries in own tenant" ON entries;
CREATE POLICY "Users can delete entries in own tenant"
  ON entries FOR DELETE
  USING (tenant_id = get_user_tenant_id() AND user_can_edit());

-- Expenses
DROP POLICY IF EXISTS "Users can insert expenses in own tenant" ON expenses;
CREATE POLICY "Users can insert expenses in own tenant"
  ON expenses FOR INSERT
  WITH CHECK (tenant_id = get_user_tenant_id() AND user_can_edit());

DROP POLICY IF EXISTS "Users can update expenses in own tenant" ON expenses;
CREATE POLICY "Users can update expenses in own tenant"
  ON expenses FOR UPDATE
  USING (tenant_id = get_user_tenant_id() AND user_can_edit());

DROP POLICY IF EXISTS "Users can delete expenses in own tenant" ON expenses;
CREATE POLICY "Users can delete expenses in own tenant"
  ON expenses FOR DELETE
  USING (tenant_id = get_user_tenant_id() AND user_can_edit());

-- Members
DROP POLICY IF EXISTS "Users can insert members in own tenant" ON members;
CREATE POLICY "Users can insert members in own tenant"
  ON members FOR INSERT
  WITH CHECK (tenant_id = get_user_tenant_id() AND user_can_edit());

DROP POLICY IF EXISTS "Users can update members in own tenant" ON members;
CREATE POLICY "Users can update members in own tenant"
  ON members FOR UPDATE
  USING (tenant_id = get_user_tenant_id() AND user_can_edit());

DROP POLICY IF EXISTS "Users can delete members from own tenant" ON members;
CREATE POLICY "Users can delete members from own tenant"
  ON members FOR DELETE
  USING (tenant_id = get_user_tenant_id() AND user_can_edit());

-- Events
DROP POLICY IF EXISTS "Users can insert events in own tenant" ON events;
CREATE POLICY "Users can insert events in own tenant"
  ON events FOR INSERT
  WITH CHECK (tenant_id = get_user_tenant_id() AND user_can_edit());

DROP POLICY IF EXISTS "Users can update events in own tenant" ON events;
CREATE POLICY "Users can update events in own tenant"
  ON events FOR UPDATE
  USING (tenant_id = get_user_tenant_id() AND user_can_edit());

DROP POLICY IF EXISTS "Users can delete events from own tenant" ON events;
CREATE POLICY "Users can delete events from own tenant"
  ON events FOR DELETE
  USING (tenant_id = get_user_tenant_id() AND user_can_edit());

-- ============================================
-- 3) Fecha o INSERT irrestrito em attendance
-- ============================================
-- As server actions de check-in (registerAttendance / registerAttendanceFixed)
-- usam o client de service role, que ignora RLS — então essa policy só é
-- relevante para quem tenta inserir direto pela API pública, e continua
-- funcionando sem exigir login (o check-in é anônimo por natureza).
DROP POLICY IF EXISTS "Anyone can insert attendance" ON attendance;
CREATE POLICY "Insert attendance for valid non-cancelled event"
  ON attendance FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = attendance.event_id
        AND events.tenant_id = attendance.tenant_id
        AND events.status <> 'cancelado'
    )
  );
