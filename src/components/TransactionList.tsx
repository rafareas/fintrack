import { useState } from 'react';
import { Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { motion } from 'framer-motion';
import { Trash2, Star, Check, X, Edit2 } from 'lucide-react';
import { cn } from '../utils/cn';
import { Category } from '../hooks/useCategories';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
  allCategories: Category[];
}

export function TransactionList({ transactions, onDelete, onUpdate, allCategories }: TransactionListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  if (transactions.length === 0) {
    return (
      <div className="text-center py-16 glass-panel border border-white/5 shadow-none">
        <p className="text-gray-400">Nenhuma transação encontrada no período.</p>
      </div>
    );
  }

  const handleStartEdit = (t: Transaction) => {
    setEditingId(t.id);
    setEditValue(t.description);
  };

  const handleSave = (id: string) => {
    if (editValue.trim()) {
      onUpdate(id, { description: editValue.trim() });
    }
    setEditingId(null);
  };

  const grouped = transactions.reduce((acc, t) => {
    if (!acc[t.date]) acc[t.date] = [];
    acc[t.date].push(t);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="space-y-8">
      {sortedDates.map((date, dateIndex) => (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: dateIndex * 0.05 }}
          key={date}
        >
          <div className="flex items-center gap-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{formatDate(date)}</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent"></div>
          </div>
          
          <div className="space-y-3">
            {grouped[date].map((t) => {
              const cat = allCategories.find(c => 
                c.id === t.category || 
                c.name === t.category || 
                (c.name && `custom_${c.name}` === t.category)
              );
              
              const Icon = cat ? cat.icon : Star;
              const categoryName = cat ? cat.name : (t.category?.toString().startsWith('custom_') ? t.category.replace('custom_', '') : t.category);
              const isIncome = t.type === 'INCOME';
              const isEditing = editingId === t.id;
              
              return (
                <div key={t.id} className="glass-panel p-4 flex items-center justify-between group/item hover:bg-white/5 hover:border-white/20 transition-all duration-300">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center border shadow-inner transition-colors shrink-0",
                      isIncome ? "bg-neon-green/10 text-neon-green border-neon-green/20 group-hover/item:bg-neon-green/20" : "bg-neon-pink/10 text-neon-pink border-neon-pink/20 group-hover/item:bg-neon-pink/20"
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center gap-2 max-w-md">
                          <input
                            autoFocus
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSave(t.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            className="glass-input h-8 py-0 px-3 text-sm flex-1"
                          />
                          <button onClick={() => handleSave(t.id)} className="text-neon-green p-1 hover:bg-neon-green/10 rounded">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="text-gray-500 p-1 hover:bg-white/5 rounded">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group/edit cursor-pointer" onClick={() => handleStartEdit(t)}>
                          <p className="text-white font-medium text-[15px] truncate">
                            {t.description}
                          </p>
                          <Edit2 className="w-3.5 h-3.5 text-gray-500 opacity-50 group-hover/edit:text-neon-blue group-hover/edit:opacity-100 transition-all sm:opacity-0 sm:group-hover/item:opacity-50" />
                        </div>
                      )}
                      <p className="text-xs text-gray-400 font-medium">{categoryName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "font-semibold tracking-wide tabular-nums",
                      isIncome ? "text-neon-green" : "text-white"
                    )}>
                      {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                    </span>
                    
                    <button 
                      onClick={() => onDelete(t.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                      title="Deletar transação"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
