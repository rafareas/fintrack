import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface DashboardProps {
  balance: number;
  income: number;
  expense: number;
  onAddTransaction: () => void;
}

export function Dashboard({ balance, income, expense, onAddTransaction }: DashboardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 sm:p-8 mb-8 relative overflow-hidden"
    >
      {/* Background soft glow using raw colors since tailwind classes bg-neon-blue/5 might need safelist depending on compilation, we'll stick to a safe general approach */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px]" />
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-gray-400 font-medium flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-neon-blue" />
            Saldo Atual
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-6">
            {formatCurrency(balance)}
          </h2>
          
          <div className="flex gap-6">
            <div>
              <p className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4 text-neon-green" /> Entradas
              </p>
              <p className="text-lg font-semibold text-neon-green">{formatCurrency(income)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                <ArrowDownRight className="w-4 h-4 text-neon-pink" /> Saídas
              </p>
              <p className="text-lg font-semibold text-neon-pink">{formatCurrency(expense)}</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={onAddTransaction}
          className="btn-primary bg-white/10 w-full md:w-auto mt-4 md:mt-0 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
        >
          <span className="text-xl leading-none mr-1">+</span> Nova Transação
        </button>
      </div>
    </motion.div>
  );
}
