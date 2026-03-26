import { Transaction } from '../types';
import { CATEGORIES } from '../constants/categories';
import { formatCurrency, formatDate } from '../utils/formatters';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { cn } from '../utils/cn';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export function TransactionList({ transactions, onDelete }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-16 glass-panel border border-white/5 shadow-none">
        <p className="text-gray-400">Nenhuma transação encontrada no período.</p>
      </div>
    );
  }

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
              const cat = Object.values(CATEGORIES).find(c => c.id === t.category) || CATEGORIES.FOOD;
              const Icon = cat.icon;
              const isIncome = t.type === 'INCOME';
              
              return (
                <div key={t.id} className="glass-panel p-4 flex items-center justify-between group hover:bg-white/5 hover:border-white/20 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center border shadow-inner transition-colors",
                      isIncome ? "bg-neon-green/10 text-neon-green border-neon-green/20 group-hover:bg-neon-green/20" : "bg-neon-pink/10 text-neon-pink border-neon-pink/20 group-hover:bg-neon-pink/20"
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-[15px]">{t.description}</p>
                      <p className="text-xs text-gray-400 font-medium">{cat.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "font-semibold tracking-wide",
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
