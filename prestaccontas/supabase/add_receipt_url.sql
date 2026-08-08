-- Adicionar coluna receipt_url nas tabelas entries e expenses
-- Cole este script no SQL Editor do Supabase

ALTER TABLE entries ADD COLUMN IF NOT EXISTS receipt_url TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS receipt_url TEXT;
