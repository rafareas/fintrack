import { useState, useMemo } from 'react';
import { Layout } from './components/Layout';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Tabs } from './components/Tabs';
import { TransactionList } from './components/TransactionList';
import { TransactionForm } from './components/TransactionForm';
import { MonthlySummary } from './components/MonthlySummary';
import { AnnualSummary } from './components/AnnualSummary';
import { useTransactions } from './hooks/useTransactions';
import { ListIcon, PieChart, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const { transactions, addTransaction, deleteTransaction } = useTransactions();
  const [activeTab, setActiveTab] = useState('transactions');
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const currentDate = useMemo(() => new Date(), []);
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const availableYears = useMemo(() => {
    const years = new Set(transactions.map(t => {
      const parts = t.date.split('-');
      return Number(parts[0]);
    }));
    years.add(currentDate.getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions, currentDate]);

  const { balance, income, expense, filteredTransactions } = useMemo(() => {
    const filtered = transactions.filter(t => {
      const [y, m] = t.date.split('-');
      return Number(y) === selectedYear && Number(m) === selectedMonth;
    });

    const totals = filtered.reduce(
      (acc, t) => {
        if (t.type === 'INCOME') {
          acc.income += t.amount;
          acc.balance += t.amount;
        } else {
          acc.expense += t.amount;
          acc.balance -= t.amount;
        }
        return acc;
      },
      { balance: 0, income: 0, expense: 0 }
    );
    return { ...totals, filteredTransactions: filtered };
  }, [transactions, selectedMonth, selectedYear]);

  const TABS = [
    { id: 'transactions', label: 'Transações', icon: <ListIcon className="w-4 h-4" /> },
    { id: 'monthly', label: 'Mensal', icon: <PieChart className="w-4 h-4" /> },
    { id: 'annual', label: 'Anual', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  return (
    <Layout>
      <Header />
      
      <Dashboard 
        balance={balance} 
        income={income} 
        expense={expense} 
        onAddTransaction={() => setIsFormOpen(true)} 
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <Tabs 
          tabs={TABS} 
          activeTab={activeTab} 
          onChange={setActiveTab} 
        />
        
        <div className="flex items-center gap-3 bg-white/5 px-4 py-2.5 rounded-xl mb-8 sm:mb-0 border border-white/10 shadow-inner">
          <CalendarIcon className="w-4 h-4 text-neon-blue" />
          
          {activeTab !== 'annual' && (
            <>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-transparent text-white font-medium text-sm outline-none cursor-pointer appearance-none"
              >
                {Array.from({ length: 12 }).map((_, i) => {
                  const date = new Date(2000, i, 1);
                  return (
                    <option key={i + 1} value={i + 1} className="text-gray-900">
                      {date.toLocaleString('pt-BR', { month: 'long' }).replace(/^\w/, c => c.toUpperCase())}
                    </option>
                  );
                })}
              </select>
              <span className="text-white/30">/</span>
            </>
          )}

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-transparent text-gray-300 font-medium text-sm outline-none cursor-pointer appearance-none"
          >
            {availableYears.map(year => (
              <option key={year} value={year} className="text-gray-900">
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="relative w-full pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'transactions' && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TransactionList 
                transactions={filteredTransactions} 
                onDelete={deleteTransaction} 
              />
            </motion.div>
          )}

          {activeTab === 'monthly' && (
            <motion.div
              key="monthly"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <MonthlySummary 
                transactions={transactions} 
                month={selectedMonth} 
                year={selectedYear} 
              />
            </motion.div>
          )}

          {activeTab === 'annual' && (
            <motion.div
              key="annual"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AnnualSummary 
                transactions={transactions} 
                year={selectedYear} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <TransactionForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSave={addTransaction} 
      />
    </Layout>
  );
}

export default App;
