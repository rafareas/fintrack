import { useMemo } from 'react';
import { Transaction } from '../types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CATEGORIES } from '../constants/categories';
import { motion } from 'framer-motion';
import { formatCurrency } from '../utils/formatters';

interface Props {
  transactions: Transaction[];
  month: number;
  year: number;
}

const DONUT_COLORS = ['#ff007f', '#ff0055', '#ff3399', '#ff66b2', '#ff99cc', '#e60073'];

export function MonthlySummary({ transactions, month, year }: Props) {
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

  const barData = [
    { name: 'Receitas', valor: income, fill: '#00ff88' },
    { name: 'Despesas', valor: expense, fill: '#ff007f' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
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
