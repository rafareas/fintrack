import { useState } from 'react';
import { X } from 'lucide-react';
import { TransactionType, Transaction } from '../types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../constants/categories';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'>) => void;
}

export function TransactionForm({ isOpen, onClose, onSave }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<string>('');

  if (!isOpen) return null;

  const categories = type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !category) return;

    onSave({
      amount: Number(amount),
      description,
      date,
      type,
      category,
    });
    
    setAmount('');
    setDescription('');
    setCategory('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-md" 
          onClick={onClose} 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass-panel w-full max-w-lg relative z-10 p-6 md:p-8 border border-white/20"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full transition-colors text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-2xl font-bold mb-6 text-white">Nova Transação</h2>
          
          <div className="flex bg-black/40 p-1.5 rounded-xl mb-6 shadow-inner">
            <button
              onClick={() => { setType('EXPENSE'); setCategory(''); }}
              type="button"
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                type === 'EXPENSE' ? "bg-neon-pink/20 text-neon-pink shadow-md border border-neon-pink/30" : "text-gray-400 hover:text-white"
              )}
            >
              Saída
            </button>
            <button
              onClick={() => { setType('INCOME'); setCategory(''); }}
              type="button"
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                type === 'INCOME' ? "bg-neon-green/20 text-neon-green shadow-md border border-neon-green/30" : "text-gray-400 hover:text-white"
              )}
            >
              Entrada
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Valor</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">€</span>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="glass-input w-full pl-12 text-lg font-medium tracking-wider"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Descrição</label>
              <input 
                type="text" 
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="glass-input w-full"
                placeholder="Ex: Aluguel do apartamento"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Data</label>
              <input 
                type="date" 
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="glass-input w-full block"
                style={{ colorScheme: 'dark' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Categoria</label>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {categories.map(c => {
                  const Icon = c.icon;
                  const isSelected = category === c.id;
                  const selectedColor = type === 'INCOME' ? 'border-neon-green/50 bg-neon-green/10 text-neon-green' : 'border-neon-pink/50 bg-neon-pink/10 text-neon-pink';
                  
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategory(c.id)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all duration-200",
                        isSelected 
                          ? selectedColor
                          : "border-transparent text-gray-400 bg-white/5 hover:bg-white/10"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[10px] font-medium truncate w-full text-center leading-none">{c.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <button 
              type="submit" 
              className={cn("w-full mt-6 shadow-xl", type === 'INCOME' ? 'btn-neon-green' : 'btn-neon-pink')}
            >
              Salvar Transação
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
