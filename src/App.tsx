import { useState, useMemo, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Tabs } from './components/Tabs';
import { TransactionList } from './components/TransactionList';
import { TransactionForm } from './components/TransactionForm';
import { MonthlySummary } from './components/MonthlySummary';
import { AnnualSummary } from './components/AnnualSummary';
import { useTransactions } from './hooks/useTransactions';
import { useCategories } from './hooks/useCategories';
import { useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { ListIcon, PieChart, TrendingUp, Calendar as CalendarIcon, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from './utils/cn';
import { TransactionType } from './types';

function App() {
  const { user, loading: authLoading } = useAuth();
  const { transactions, addTransaction, deleteTransaction, updateTransaction, fetchTransactions } = useTransactions();
  const { allCategories } = useCategories();
  const [activeTab, setActiveTab] = useState('transactions');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formInitialType, setFormInitialType] = useState<TransactionType>('EXPENSE');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string | null>(null);
  
  const currentDate = useMemo(() => new Date(), []);
  
  // Initialize from localStorage or fallback to current date
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const saved = localStorage.getItem('selectedMonth');
    return saved ? Number(saved) : (currentDate.getMonth() + 1);
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    const saved = localStorage.getItem('selectedYear');
    return saved ? Number(saved) : currentDate.getFullYear();
  });

  // Sync to localStorage when values change
  useEffect(() => {
    localStorage.setItem('selectedMonth', selectedMonth.toString());
  }, [selectedMonth]);

  useEffect(() => {
    localStorage.setItem('selectedYear', selectedYear.toString());
  }, [selectedYear]);

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
      const matchesDate = Number(y) === selectedYear && Number(m) === selectedMonth;
      const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedFilterCategory || 
                              t.category === selectedFilterCategory || 
                              (allCategories.find(c => c.id === selectedFilterCategory)?.name === t.category);
      
      return matchesDate && matchesSearch && matchesCategory;
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
  }, [transactions, selectedMonth, selectedYear, searchQuery, selectedFilterCategory, allCategories]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/10 border-t-neon-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const handleOpenForm = (type: TransactionType) => {
    setFormInitialType(type);
    setIsFormOpen(true);
  };

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
        onAddTransaction={handleOpenForm} 
      />
      
      {/* Rest of the component continues... */}
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
              className="space-y-6"
            >
              {/* Search and Category Filters */}
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-neon-blue transition-colors">
                    <Search className="w-4 h-4" />
                  </div>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Pesquisar por descrição..."
                    className="glass-input w-full pl-11 h-12 text-sm"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-500 hover:text-white transition-colors"
                    >
                      LIMPAR
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  <button
                    onClick={() => setSelectedFilterCategory(null)}
                    className={cn(
                      "flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-bold border transition-all duration-300",
                      selectedFilterCategory === null 
                        ? "bg-neon-blue/20 border-neon-blue/40 text-neon-blue shadow-[0_0_15px_rgba(0,229,255,0.1)]" 
                        : "bg-white/5 border-white/10 text-gray-500 hover:border-white/20"
                    )}
                  >
                    TODAS
                  </button>
                  {allCategories.map(cat => {
                    const isSelected = selectedFilterCategory === cat.id;
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedFilterCategory(isSelected ? null : cat.id)}
                        className={cn(
                          "flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-bold border transition-all duration-300 flex items-center gap-2",
                          isSelected 
                            ? "bg-white/10 border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
                            : "bg-white/5 border-white/10 text-gray-500 hover:border-white/20 text-white/50"
                        )}
                      >
                        <Icon className={cn("w-3 h-3", isSelected ? cat.color : "text-gray-500")} />
                        {cat.name.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>

              <TransactionList 
                transactions={filteredTransactions} 
                onDelete={deleteTransaction} 
                onUpdate={updateTransaction}
                allCategories={allCategories}
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
        initialType={formInitialType}
        onCategoriesChanged={fetchTransactions}
      />
    </Layout>
  );
}

export default App;
