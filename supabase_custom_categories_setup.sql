-- 1. Criar a tabela de categorias personalizadas
CREATE TABLE custom_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
  icon_name text DEFAULT 'PlusCircle',
  color text DEFAULT 'text-neon-blue',
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, name, type)
);

-- 2. Habilitar a segurança de linha (RLS)
ALTER TABLE custom_categories ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Privacidade
CREATE POLICY "Users can only read their own categories" ON custom_categories FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert their own categories" ON custom_categories FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only update their own categories" ON custom_categories FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only delete their own categories" ON custom_categories FOR DELETE TO authenticated USING (auth.uid() = user_id);
