-- ============================================================
-- Script de Setup para Comprovantes no Supabase Storage
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- 1. Criar o bucket 'receipts' (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts',
  'receipts',
  true,  -- Bucket público para facilitar visualização
  5242880,  -- 5MB em bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']::text[];

-- 2. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Authenticated users can upload receipts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Public can view receipts" ON storage.objects;

-- 3. Criar políticas de acesso

-- Permitir upload para usuários autenticados
CREATE POLICY "Authenticated users can upload receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'receipts');

-- Permitir visualização pública (já que o bucket é público)
CREATE POLICY "Public can view receipts"
ON storage.objects FOR SELECT
USING (bucket_id = 'receipts');

-- Permitir exclusão apenas pelo próprio usuário
CREATE POLICY "Users can delete own receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'receipts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Verificar se o bucket foi criado
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'receipts';
