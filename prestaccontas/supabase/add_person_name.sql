-- Adicionar coluna person_name nas tabelas entries e expenses
-- Cole este script no SQL Editor do Supabase

ALTER TABLE entries ADD COLUMN IF NOT EXISTS person_name TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS person_name TEXT;
