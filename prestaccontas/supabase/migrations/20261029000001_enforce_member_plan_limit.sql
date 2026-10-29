-- Migration: Blindar o limite de membros do plano no banco
-- Created: 2026-10-29
--
-- Até aqui o limite (150 no plano 'starter') só era validado no servidor
-- (src/lib/plans.ts -> canAddMember). Um INSERT direto no banco ou via
-- service_role passava batido. Este trigger torna a regra incontornável.
--
-- O limite vive em src/lib/plans.ts (PLANS.starter.memberLimit). Se mudar
-- lá, mude aqui também.

CREATE OR REPLACE FUNCTION public.enforce_member_plan_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan  TEXT;
  v_count INTEGER;
  v_limit CONSTANT INTEGER := 150; -- PLANS.starter.memberLimit
BEGIN
  SELECT plan INTO v_plan FROM tenants WHERE id = NEW.tenant_id;

  -- Apenas o plano 'starter' é limitado. free/pro/enterprise são ilimitados,
  -- espelhando getMemberLimit() em src/lib/plans.ts.
  IF v_plan IS DISTINCT FROM 'starter' THEN
    RETURN NEW;
  END IF;

  SELECT count(*) INTO v_count FROM members WHERE tenant_id = NEW.tenant_id;

  IF v_count >= v_limit THEN
    RAISE EXCEPTION
      'Limite de % membros atingido no plano atual. Faça upgrade para o plano Completo para membros ilimitados.',
      v_limit
      USING ERRCODE = 'check_violation',
            HINT = 'Plano starter aceita até 150 membros cadastrados.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_member_plan_limit ON members;

CREATE TRIGGER trg_enforce_member_plan_limit
  BEFORE INSERT ON members
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_member_plan_limit();

COMMENT ON FUNCTION public.enforce_member_plan_limit() IS
  'Bloqueia INSERT em members quando o tenant no plano starter já atingiu 150 membros.';
