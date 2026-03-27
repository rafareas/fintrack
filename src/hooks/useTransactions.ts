import { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch from Supabase on mount or when user changes
  useEffect(() => {
    if (user) {
      fetchTransactions();
    } else {
      setTransactions([]);
      setLoading(false);
    }
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Erro ao buscar transações no Supabase:', error);
    } else if (data) {
      const formattedData = data.map(item => ({
        ...item,
        amount: Number(item.amount)
      })) as Transaction[];
      setTransactions(formattedData);
    }
    setLoading(false);
  };

  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    if (!user) return;
    
    // Insere no banco vinculando ao user_id
    const { data, error } = await supabase
      .from('transactions')
      .insert([{ ...t, user_id: user.id }])
      .select();

    if (error) {
      console.error('Erro ao inserir transação:', error);
      return;
    }

    if (data && data[0]) {
      const novaTransacao = { ...data[0], amount: Number(data[0].amount) } as Transaction;
      setTransactions(prev => {
        const atualizadas = [novaTransacao, ...prev];
        return atualizadas.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      });
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;

    // Apaga do banco garantindo que pertence ao usuário
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Erro ao excluir transação:', error);
      return;
    }

    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  return { transactions, addTransaction, deleteTransaction, loading };
}
