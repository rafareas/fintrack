import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Budget {
  id?: string;
  limit_amount: number;
  selected_categories: string[];
  month: number;
  year: number;
}

export function useBudget(month: number, year: number) {
  const { user } = useAuth();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBudget();
    }
  }, [user, month, year]);

  const fetchBudget = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user?.id)
      .eq('month', month)
      .eq('year', year)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is 'no rows returned'
      console.error('Erro ao buscar orçamento:', error);
    } else {
      setBudget(data || null);
    }
    setLoading(false);
  };

  const saveBudget = async (limit_amount: number, selected_categories: string[]) => {
    if (!user) return;

    const budgetData = {
      user_id: user.id,
      month,
      year,
      limit_amount,
      selected_categories,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (budget?.id) {
      // Update
      result = await supabase
        .from('budgets')
        .update(budgetData)
        .eq('id', budget.id)
        .select()
        .single();
    } else {
      // Insert
      result = await supabase
        .from('budgets')
        .insert([budgetData])
        .select()
        .single();
    }

    if (result.error) {
      console.error('Erro ao salvar orçamento:', result.error);
    } else {
      setBudget(result.data);
    }
  };

  return { budget, saveBudget, loading };
}
