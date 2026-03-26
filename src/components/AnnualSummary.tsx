import { useMemo } from 'react';
import { Transaction } from '../types';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { formatCurrency } from '../utils/formatters';
import { cn } from '../utils/cn';

interface Props {
  transactions: Transaction[];
  year: number;
}

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function AnnualSummary({ transactions, year }: Props) {
  const annualData = useMemo(() => {
    const data = MONTHS.map((m, i) => ({ month: m, index: i + 1, income: 0, expense: 0, balance: 0 }));
    
    transactions.forEach(t => {
      const [y, m] = t.date.split('-');
      if (Number(y) === year) {
        const MathMonthIndex = Number(m) - 1;
        if (t.type === 'INCOME') data[MathMonthIndex].income += t.amount;
        else data[MathMonthIndex].expense += t.amount;
      }
    });

    let cumulativeBalance = 0;
    return data.map(d => {
      cumulativeBalance += (d.income - d.expense);
      return {
        ...d,
        wealth: cumulativeBalance,
        net: d.income - d.expense
      };
    });
  }, [transactions, year]);

  const bestSavingsMonth = useMemo(() => {
    return [...annualData].sort((a,b) => b.net - a.net)[0];
  }, [annualData]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="glass-panel p-6 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-blue/5 rounded-full blur-[80px]" />
        
        <div className="mb-6 flex items-end justify-between relative z-10">
          <div>
            <h3 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-neon-blue shadow-[0_0_10px_rgba(0,229,255,1)]"></div>
              Entradas vs Saídas
            </h3>
            <p className="text-sm text-gray-400">Total acumulado neste ano de {year}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-neon-blue tracking-tight">{formatCurrency(annualData[11].wealth)}</p>
          </div>
        </div>
        
        <div className="h-72 relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={annualData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff88" stopOpacity={0.4}/>
                  <stop offset="100%" stopColor="#00ff88" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff007f" stopOpacity={0.4}/>
                  <stop offset="100%" stopColor="#ff007f" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#666" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
              <Tooltip 
                formatter={(value: any, name: any) => [formatCurrency(Number(value) || 0), name === 'income' ? 'Entradas' : name === 'expense' ? 'Saídas' : name]}
                contentStyle={{ backgroundColor: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ fontWeight: 600 }}
                labelStyle={{ color: '#aaa', marginBottom: '8px' }}
              />
              <Area 
                type="monotone" 
                dataKey="income" 
                name="income"
                stroke="#00ff88" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorIncome)" 
              />
              <Area 
                type="monotone" 
                dataKey="expense" 
                name="expense"
                stroke="#ff007f" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorExpense)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-panel p-6 border border-white/5">
        <h3 className="text-lg font-medium text-white mb-6">Detalhamento Mensal</h3>
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full text-left border-collapse">
            <thead className="bg-black/20">
              <tr className="text-gray-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Mês</th>
                <th className="p-4 font-semibold text-right">Entradas</th>
                <th className="p-4 font-semibold text-right">Saídas</th>
                <th className="p-4 font-semibold text-right">Balanço Líquido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {annualData.map((d) => (
                <tr key={d.month} className={cn(
                  "hover:bg-white/5 transition-colors",
                  bestSavingsMonth.net > 0 && d.month === bestSavingsMonth.month ? "bg-neon-green/5" : ""
                )}>
                  <td className="p-4 text-white font-medium flex items-center gap-2">
                    {d.month}
                    {bestSavingsMonth.net > 0 && d.month === bestSavingsMonth.month && (
                      <span className="tag-green select-none">Recorde</span>
                    )}
                  </td>
                  <td className="p-4 text-right text-neon-green font-medium">{formatCurrency(d.income)}</td>
                  <td className="p-4 text-right text-neon-pink font-medium">{formatCurrency(d.expense)}</td>
                  <td className={cn(
                    "p-4 text-right font-bold",
                    d.net >= 0 ? "text-neon-green" : "text-neon-pink"
                  )}>
                    {d.net >= 0 ? '+' : ''}{formatCurrency(d.net)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
