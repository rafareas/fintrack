import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORIES as DEFAULT_CATEGORIES } from '../constants/categories';
import { 
  Star, 
  PlusCircle, 
  HelpCircle, 
  LucideIcon, 
  Tag, 
  Heart, 
  ShoppingBag, 
  Wallet, 
  Zap, 
  Gift, 
  Coffee,
  Smartphone,
  Cpu,
  Gamepad2,
  Plane,
  Bike
} from 'lucide-react';

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
  Tag,
  Heart,
  ShoppingBag,
  Wallet,
  Zap,
  Gift,
  Coffee,
  Smartphone,
  Cpu,
  Gamepad2,
  Plane,
  Bike
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
        id: cat.id, // Use the actual database UUID as the identifier
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

  const getCategoryIdByName = (name: string, type: 'INCOME' | 'EXPENSE') => {
    return customCategories.find(c => c.name === name && c.type === type)?.id;
  };

  const addCategory = async (name: string, type: 'INCOME' | 'EXPENSE') => {
    if (!user) return;

    const newCat = {
      user_id: user.id,
      name,
      type,
      icon_name: 'Star', // Default icon for custom
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
        id: data.id, // Use the actual database UUID
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

  const deleteCategory = async (name: string, type: 'INCOME' | 'EXPENSE') => {
    if (!user) return;

    // 1. Delete transactions first
    const catId = getCategoryIdByName(name, type);
    const categoryIdentifiers = [name];
    if (catId) categoryIdentifiers.push(catId);
    if (name.startsWith('custom_')) categoryIdentifiers.push(name.replace('custom_', ''));
    else categoryIdentifiers.push(`custom_${name}`);

    const { error: tError } = await supabase
      .from('transactions')
      .delete()
      .eq('user_id', user.id)
      .in('category', categoryIdentifiers)
      .eq('type', type);

    if (tError) {
      console.error('Erro ao excluir transações da categoria:', tError);
      return { error: tError };
    }

    // 2. Delete the category itself
    const { error: cError } = await supabase
      .from('custom_categories')
      .delete()
      .eq('user_id', user.id)
      .eq('name', name)
      .eq('type', type);

    if (cError) {
      console.error('Erro ao excluir categoria:', cError);
      return { error: cError };
    }

    setCustomCategories(prev => prev.filter(c => !(c.name === name && c.type === type)));
    return { success: true };
  };

  const updateCategory = async (oldName: string, newName: string, type: 'INCOME' | 'EXPENSE') => {
    if (!user) return;

    // 1. Update transactions first
    const catId = getCategoryIdByName(oldName, type);
    const categoryIdentifiers = [oldName];
    if (catId) categoryIdentifiers.push(catId);
    if (oldName.startsWith('custom_')) categoryIdentifiers.push(oldName.replace('custom_', ''));
    else categoryIdentifiers.push(`custom_${oldName}`);

    const { error: tError } = await supabase
      .from('transactions')
      .update({ category: catId || newName }) // Try to use the ID if possible
      .eq('user_id', user.id)
      .in('category', categoryIdentifiers)
      .eq('type', type);

    if (tError) {
      console.error('Erro ao atualizar transações da categoria:', tError);
      return { error: tError };
    }

    // 2. Update the category itself
    const { error: cError } = await supabase
      .from('custom_categories')
      .update({ name: newName })
      .eq('user_id', user.id)
      .eq('name', oldName)
      .eq('type', type);

    if (cError) {
      console.error('Erro ao editar categoria:', cError);
      return { error: cError };
    }

    setCustomCategories(prev => prev.map(c => 
      (c.name === oldName && c.type === type) ? { ...c, name: newName, id: `custom_${newName}` } : c
    ));
    return { success: true };
  };

  const allCategories: Category[] = [
    ...Object.values(DEFAULT_CATEGORIES).map(c => ({
      ...c,
      id: c.id, 
      type: (c.id === 'SALARY' || c.id === 'FREELANCE' || c.id === 'OTHER_INCOME') ? 'INCOME' : 'EXPENSE' as 'EXPENSE' | 'INCOME'
    })),
    ...customCategories,
  ];

  const getIncomeCategories = () => 
    allCategories.filter(c => c.type === 'INCOME');

  const getExpenseCategories = () => 
    allCategories.filter(c => c.type === 'EXPENSE');

  // Diagnostic log for the reported issue
  useEffect(() => {
    if (customCategories.length > 0) {
      console.log('[DEBUG] Custom Categories:', customCategories.map(c => ({id: c.id, name: c.name, type: c.type, icon: c.icon.name || 'LucideIcon'})));
    }
  }, [customCategories]);

  return { 
    customCategories, 
    allCategories, 
    getIncomeCategories, 
    getExpenseCategories, 
    addCategory, 
    deleteCategory,
    updateCategory,
    loading 
  };
}

