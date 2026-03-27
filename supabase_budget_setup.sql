-- 1. Criar a tabela de orçamentos (Teto de Gastos)
CREATE TABLE budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  month integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  year integer NOT NULL,
  limit_amount numeric NOT NULL DEFAULT 0,
  selected_categories text[] NOT NULL DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, month, year)
);

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas para que cada usuário veja/edite apenas o seu próprio teto
CREATE POLICY "Users can only read their own budgets" 
ON budgets FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own budgets" 
ON budgets FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own budgets" 
ON budgets FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own budgets" 
ON budgets FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);
