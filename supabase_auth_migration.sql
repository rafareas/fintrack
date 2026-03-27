-- 1. Remover políticas antigas que eram públicas
DROP POLICY IF EXISTS "Enable read access for all users" ON transactions;
DROP POLICY IF EXISTS "Enable insert for all users" ON transactions;
DROP POLICY IF EXISTS "Enable delete for all users" ON transactions;
DROP POLICY IF EXISTS "Enable update for all users" ON transactions;

-- 2. Adicionar coluna user_id obrigatória
-- Usamos auth.uid() como default para novas inserções
ALTER TABLE transactions 
ADD COLUMN user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Garantir que RLS está habilitado
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 4. Criar novas políticas de segurança baseadas no usuário autenticado
CREATE POLICY "Users can only read their own transactions" 
ON transactions FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own transactions" 
ON transactions FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own transactions" 
ON transactions FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own transactions" 
ON transactions FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);
