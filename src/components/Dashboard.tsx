import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Activity, Plus, Minus } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { TransactionType } from '../types';

interface DashboardProps {
  balance: number;
  income: number;
  expense: number;
  onAddTransaction: (type: TransactionType) => void;
}

export function Dashboard({ balance, income, expense, onAddTransaction }: DashboardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 sm:p-8 mb-8 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px]" />
      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="flex-1">
          <p className="text-gray-400 font-medium flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-neon-blue" />
            Saldo Atual
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-6">
            {formatCurrency(balance)}
          </h2>
          
          <div className="flex gap-8">
            <div className="group cursor-default">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1 flex items-center gap-1.5 transition-colors group-hover:text-neon-green/70">
                <ArrowUpRight className="w-3.5 h-3.5 text-neon-green" /> Entradas
              </p>
              <p className="text-xl font-black text-neon-green drop-shadow-[0_0_10px_rgba(0,255,136,0.2)]">
                {formatCurrency(income)}
              </p>
            </div>
            <div className="group cursor-default">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1 flex items-center gap-1.5 transition-colors group-hover:text-neon-pink/70">
                <ArrowDownRight className="w-3.5 h-3.5 text-neon-pink" /> Saídas
              </p>
              <p className="text-xl font-black text-neon-pink drop-shadow-[0_0_10px_rgba(255,0,127,0.2)]">
                {formatCurrency(expense)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <button 
            onClick={() => onAddTransaction('INCOME')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-neon-green/10 hover:bg-neon-green/20 border border-neon-green/30 text-neon-green font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-neon-green/10"
          >
            <Plus className="w-4 h-4" />
            Nova Entrada
          </button>
          
          <button 
            onClick={() => onAddTransaction('EXPENSE')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-neon-pink/10 hover:bg-neon-pink/20 border border-neon-pink/30 text-neon-pink font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-neon-pink/10"
          >
            <Minus className="w-4 h-4" />
            Nova Saída
          </button>
        </div>
      </div>
    </motion.div>
  );
}
