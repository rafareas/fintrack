import { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { supabase } from '../lib/supabase';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch from Supabase on mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Erro ao buscar transações no Supabase:', error);
    } else if (data) {
      // Garantir que os dados do banco venham com os tipos corretos
      const formattedData = data.map(item => ({
        ...item,
        amount: Number(item.amount)
      })) as Transaction[];
      setTransactions(formattedData);
    }
    setLoading(false);
  };

  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    // Insere no banco
    const { data, error } = await supabase
      .from('transactions')
      .insert([t])
      .select();

    if (error) {
      console.error('Erro ao inserir transação:', error);
      return;
    }

    if (data && data[0]) {
      const novaTransacao = { ...data[0], amount: Number(data[0].amount) } as Transaction;
      // Atualiza estado local mantendo a ordem (mais recente primeiro)
      setTransactions(prev => {
        const atualizadas = [novaTransacao, ...prev];
        return atualizadas.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      });
    }
  };

  const deleteTransaction = async (id: string) => {
    // Apaga do banco
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir transação:', error);
      return;
    }

    // Atualiza estado local
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  return { transactions, addTransaction, deleteTransaction, loading };
}
