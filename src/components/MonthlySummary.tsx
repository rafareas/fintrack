import { useMemo, useState, useEffect } from 'react';
import { Transaction } from '../types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell as ReCell } from 'recharts';
import { CATEGORIES, EXPENSE_CATEGORIES } from '../constants/categories';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../utils/formatters';
import { useBudget } from '../hooks/useBudget';
import { Plus, Target, Check, Settings, AlertCircle, ChevronUp } from 'lucide-react';
import { cn } from '../utils/cn';

interface Props {
  transactions: Transaction[];
  month: number;
  year: number;
}

const DONUT_COLORS = ['#ff007f', '#ff0055', '#ff3399', '#ff66b2', '#ff99cc', '#e60073'];

export function MonthlySummary({ transactions, month, year }: Props) {
  const { budget, saveBudget, loading: budgetLoading } = useBudget(month, year);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [tempLimit, setTempLimit] = useState('');
  const [tempCategories, setTempCategories] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const [y, m] = t.date.split('-');
      return Number(y) === year && Number(m) === month;
    });
  }, [transactions, month, year]);

  const { income, expense } = useMemo(() => {
    return filtered.reduce(
      (acc, t) => {
        if (t.type === 'INCOME') acc.income += t.amount;
        else acc.expense += t.amount;
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [filtered]);

  const expensesByCategory = useMemo(() => {
    const map = new Map<string, number>();
    filtered.filter(t => t.type === 'EXPENSE').forEach(t => {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    });
    return Array.from(map.entries()).map(([catId, amount]) => {
      const c = Object.values(CATEGORIES).find(c => c.id === catId);
      return {
        name: c?.name || catId,
        value: amount,
      };
    }).sort((a,b) => b.value - a.value);
  }, [filtered]);

  const budgetActual = useMemo(() => {
    if (!budget) return 0;
    return filtered
      .filter(t => t.type === 'EXPENSE' && budget.selected_categories.includes(t.category))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filtered, budget]);

  const budgetProgress = budget?.limit_amount && budget.limit_amount > 0 
    ? (budgetActual / budget.limit_amount) * 100 
    : 0;

  useEffect(() => {
    if (budget) {
      setTempLimit(budget.limit_amount.toString());
      setTempCategories(budget.selected_categories);
    } else {
      setTempLimit('');
      setTempCategories([]);
    }
  }, [budget]);

  const handleToggleCategory = (id: string) => {
    setTempCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSaveBudget = async () => {
    await saveBudget(Number(tempLimit) || 0, tempCategories);
    setShowBudgetForm(false);
  };

  const barData = [
    { name: 'Receitas', valor: income, fill: '#00ff88' },
    { name: 'Despesas', valor: expense, fill: '#ff007f' },
  ];

  const budgetBarData = [
    { name: 'Teto Meta', valor: budget?.limit_amount || 0, fill: 'rgba(255,255,255,0.1)' },
    { name: 'Gasto Real', valor: budgetActual, fill: budgetProgress > 100 ? '#ff007f' : '#00e5ff' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Budget Section */}
      <div className="glass-panel p-6 border border-white/5 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neon-blue/10 flex items-center justify-center border border-neon-blue/20">
              <Target className="w-5 h-5 text-neon-blue" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">Teto de Gastos</h3>
              <p className="text-xs text-gray-400">Meta mensal personalizada</p>
            </div>
          </div>
          <button 
            onClick={() => setShowBudgetForm(!showBudgetForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-gray-300 transition-all"
          >
            {showBudgetForm ? <ChevronUp className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
            {budget ? 'Ajustar Meta' : 'Definir Meta'}
          </button>
        </div>

        <AnimatePresence>
          {showBudgetForm && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-8 space-y-6 pt-2 border-t border-white/5"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-300 ml-1">Valor do Teto em Euro</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neon-blue font-bold">€</span>
                    <input 
                      type="number" 
                      value={tempLimit}
                      onChange={e => setTempLimit(e.target.value)}
                      placeholder="Ex: 500"
                      className="glass-input w-full pl-10 h-12 text-lg font-bold"
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 ml-1 italic">* Valor específico para este mês e ano.</p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-300 ml-1">Categorias que contam no teto</label>
                  <div className="flex flex-wrap gap-2">
                    {EXPENSE_CATEGORIES.map(cat => {
                      const isSelected = tempCategories.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          onClick={() => handleToggleCategory(cat.id)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5",
                            isSelected 
                              ? "bg-neon-blue/20 border-neon-blue/40 text-neon-blue" 
                              : "bg-white/5 border-white/10 text-gray-500 hover:border-white/20"
                          )}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-2">
                <button 
                  onClick={() => setShowBudgetForm(false)}
                  className="px-6 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveBudget}
                  disabled={budgetLoading}
                  className="px-8 py-2 rounded-xl bg-neon-blue text-black font-bold text-sm shadow-lg shadow-neon-blue/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Salvar Teto
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {budget ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-black/20 rounded-2xl p-5 border border-white/5 shadow-inner">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Gasto Atual no Teto</p>
                    <p className={cn("text-3xl font-black tabular-nums", budgetProgress > 100 ? "text-neon-pink" : "text-neon-blue")}>
                      {formatCurrency(budgetActual)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Limite Meta</p>
                    <p className="text-xl font-bold text-white/80">{formatCurrency(budget.limit_amount)}</p>
                  </div>
                </div>
                
                <div className="relative h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(budgetProgress, 100)}%` }}
                    className={cn(
                      "absolute top-0 left-0 h-full rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)]",
                      budgetProgress > 90 ? "bg-neon-pink" : "bg-neon-blue"
                    )}
                  />
                  {budgetProgress > 100 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-neon-pink/20 animate-pulse"
                    />
                  )}
                </div>

                <div className="flex justify-between mt-3">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">0%</span>
                  {budgetProgress > 100 ? (
                    <span className="text-[10px] font-bold text-neon-pink uppercase flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Excedeu teto em {formatCurrency(budgetActual - budget.limit_amount)}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Restam {formatCurrency(budget.limit_amount - budgetActual)}</span>
                  )}
                  <span className="text-[10px] font-bold text-gray-500 uppercase">100%</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1.5">
                {budget.selected_categories.map(catId => {
                  const c = Object.values(CATEGORIES).find(c => c.id === catId);
                  return (
                    <span key={catId} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-gray-400 font-medium">
                      {c?.name}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-7 h-48 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetBarData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    formatter={(value: any) => formatCurrency(Number(value) || 0)}
                    contentStyle={{ backgroundColor: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontWeight: '500' }}
                  />
                  <Bar dataKey="valor" radius={[0, 6, 6, 0]} barSize={32}>
                    {budgetBarData.map((entry, index) => (
                      <ReCell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl bg-black/10">
            <div className="p-4 rounded-full bg-white/5 mb-4">
              <Plus className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium text-center">Você ainda não definiu um teto de gastos para este mês.</p>
            <button 
              onClick={() => setShowBudgetForm(true)}
              className="mt-6 px-8 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold transition-all"
            >
              Configurar Primeiro Teto
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 border border-white/5">
          <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-pink shadow-[0_0_10px_rgba(255,0,127,1)]"></div>
            Distribuição de Despesas
          </h3>
          <div className="h-64">
            {expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                  >
                    {expensesByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(Number(value) || 0)}
                    contentStyle={{ backgroundColor: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontWeight: '500' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 font-medium">
                Nenhuma despesa neste mês.
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {expensesByCategory.map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs text-gray-300 font-medium">
                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }}></div>
                {item.name}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 border border-white/5">
          <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-blue shadow-[0_0_10px_rgba(0,229,255,1)]"></div>
            Receitas vs Despesas
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#666" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 13, fontWeight: 500}} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  formatter={(value: any) => formatCurrency(Number(value) || 0)}
                  contentStyle={{ backgroundColor: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontWeight: '500' }}
                  labelStyle={{ color: '#aaa', marginBottom: '8px' }}
                />
                <Bar dataKey="valor" radius={[6, 6, 0, 0]} maxBarSize={60}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
