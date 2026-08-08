-- ============================================================
-- Migration: Adicionar suporte a comprovantes (receipt_url)
-- ============================================================

-- Adicionar coluna receipt_url na tabela entries
ALTER TABLE public.entries
ADD COLUMN receipt_url TEXT;

-- Adicionar coluna receipt_url na tabela expenses
ALTER TABLE public.expenses
ADD COLUMN receipt_url TEXT;

-- Criar bucket no Supabase Storage para comprovantes
-- Execute este comando no painel do Supabase Storage ou via SQL:
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('receipts', 'receipts', false);

-- Policy para permitir upload de arquivos (execute no Supabase)
-- CREATE POLICY "Users can upload receipts"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'receipts'
--   AND auth.uid()::text = (storage.foldername(name))[1]
-- );

-- CREATE POLICY "Users can view their tenant receipts"
-- ON storage.objects FOR SELECT
-- USING (
--   bucket_id = 'receipts'
--   AND auth.uid()::text = (storage.foldername(name))[1]
-- );

-- CREATE POLICY "Users can delete their own receipts"
-- ON storage.objects FOR DELETE
-- USING (
--   bucket_id = 'receipts'
--   AND auth.uid()::text = (storage.foldername(name))[1]
-- );
