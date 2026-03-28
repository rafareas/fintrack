import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORIES as DEFAULT_CATEGORIES } from '../constants/categories';
import { Star, PlusCircle, HelpCircle, LucideIcon } from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  type: 'INCOME' | 'EXPENSE';
  isCustom?: boolean;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Star,
  PlusCircle,
  HelpCircle,
};

export function useCategories() {
  const { user } = useAuth();
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCustomCategories();
    }
  }, [user]);

  const fetchCustomCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('custom_categories')
      .select('*')
      .eq('user_id', user?.id)
      .order('name');

    if (error) {
      console.error('Erro ao buscar categorias:', error);
    } else {
      const formatted = data.map((cat: any) => ({
        id: cat.name, // Use name as ID to match legacy behavior/comparison
        name: cat.name,
        icon: ICON_MAP[cat.icon_name] || Star,
        color: cat.color || 'text-neon-blue',
        type: cat.type,
        isCustom: true,
      }));
      setCustomCategories(formatted);
    }
    setLoading(false);
  };

  const addCategory = async (name: string, type: 'INCOME' | 'EXPENSE') => {
    if (!user) return;

    const newCat = {
      user_id: user.id,
      name,
      type,
      icon_name: 'PlusCircle',
      color: type === 'INCOME' ? 'text-neon-green' : 'text-neon-pink',
    };

    const { data, error } = await supabase
      .from('custom_categories')
      .insert([newCat])
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar categoria:', error);
      return { error };
    } else {
      const formatted: Category = {
        id: data.name,
        name: data.name,
        icon: ICON_MAP[data.icon_name] || Star,
        color: data.color,
        type: data.type as 'INCOME' | 'EXPENSE',
        isCustom: true,
      };
      setCustomCategories(prev => [...prev, formatted].sort((a, b) => a.name.localeCompare(b.name)));
      return { data: formatted };
    }
  };

  const allCategories = [
    ...Object.values(DEFAULT_CATEGORIES).map(c => ({
      ...c,
      id: c.id, // Keep original ID for default ones
      type: (c.id === 'SALARY' || c.id === 'FREELANCE' || c.id === 'OTHER_INCOME') ? 'INCOME' : 'EXPENSE'
    })),
    ...customCategories,
  ];

  const getIncomeCategories = () => 
    allCategories.filter(c => c.type === 'INCOME');

  const getExpenseCategories = () => 
    allCategories.filter(c => c.type === 'EXPENSE');

  return { 
    customCategories, 
    allCategories, 
    getIncomeCategories, 
    getExpenseCategories, 
    addCategory, 
    loading 
  };
}
