# Guia de Configuração - Comprovantes (Receipts)

## 1. Executar Migration SQL

Execute o arquivo `database/migration_receipt_url.sql` no seu Supabase SQL Editor para adicionar as colunas `receipt_url` nas tabelas `entries` e `expenses`.

## 2. Criar Bucket no Supabase Storage

No painel do Supabase:

1. Vá para **Storage** no menu lateral
2. Clique em **New Bucket**
3. Configure:
   - **Name**: `receipts`
   - **Public bucket**: **NÃO** marque (manter privado por segurança)
4. Clique em **Create bucket**

## 3. Criar Políticas de Acesso (RLS)

No SQL Editor do Supabase, execute:

```sql
-- Permitir upload de arquivos (usuários autenticados)
CREATE POLICY "Authenticated users can upload receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'receipts'
);

-- Permitir visualização de arquivos (usuários autenticados)
CREATE POLICY "Authenticated users can view receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'receipts'
);

-- Permitir exclusão de arquivos (apenas o próprio usuário)
CREATE POLICY "Users can delete own receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'receipts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## 4. Configurar CORS (se necessário)

Se houver problemas de CORS, adicione no Supabase Storage:

1. Vá para **Storage** > **Settings** (ou **Configuration**)
2. Adicione seu domínio nas origens permitidas

## 5. Testar

1. Crie uma nova entrada ou despesa
2. Clique na área de upload de comprovante
3. Selecione uma imagem (JPG, PNG, WEBP, GIF) ou PDF
4. O arquivo será enviado e o URL será salvo automaticamente

## Limitações

- **Tamanho máximo**: 5MB por arquivo
- **Tipos permitidos**: JPG, PNG, WEBP, GIF, PDF
- **Armazenamento**: Organizado por `{tenant_id}/{user_id}/{timestamp}-{random}.{ext}`

## Solução de Problemas

### Erro "Bucket not found"
- Verifique se o bucket `receipts` foi criado corretamente

### Erro "Permission denied"
- Verifique se as políticas RLS foram criadas

### Erro "File too large"
- Reduza o tamanho do arquivo (máximo 5MB)

### Upload não funciona
- Verifique se o usuário está autenticado
- Verifique o console do navegador para erros
