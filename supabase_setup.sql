-- Copie este código e cole no SQL Editor do Supabase, depois clique em RUN.

CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount numeric NOT NULL,
  date date NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  type text NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
  created_at timestamp with time zone DEFAULT now()
);

-- Como você será o único usuário, não precisamos de Row Level Security complexa, 
-- mas podemos deixar a tabela pública para facilitar.
-- AVISO: Em um app de produção com vários usuários, isso exigiria políticas de segurança (RLS).
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON transactions FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON transactions FOR DELETE USING (true);
CREATE POLICY "Enable update for all users" ON transactions FOR UPDATE USING (true);
