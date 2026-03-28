import { useState, useEffect } from 'react';
import { X, Check, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { TransactionType, Transaction } from '../types';
import { useCategories, Category } from '../hooks/useCategories';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'>) => void;
  initialType?: TransactionType;
  onCategoriesChanged?: () => void;
}

export function TransactionForm({ isOpen, onClose, onSave, initialType = 'EXPENSE', onCategoriesChanged }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(initialType);
  const { getIncomeCategories, getExpenseCategories, addCategory, deleteCategory, updateCategory } = useCategories();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
    }
  }, [isOpen, initialType]);

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<string>('');

  if (!isOpen) return null;

  const categories = (type === 'INCOME' ? getIncomeCategories() : getExpenseCategories()) as Category[];

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    const result = await addCategory(newCategoryName.trim(), type);
    if (result && !('error' in result) && result.data) {
      setCategory(result.data.id);
      setIsAddingCategory(false);
      setNewCategoryName('');
    }
  };

  const startEditing = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setEditingName(cat.name);
  };

  const handleUpdateCategory = async (oldName: string) => {
    if (!editingName.trim() || editingName === oldName) {
      setEditingCategoryId(null);
      return;
    }
    const result = await updateCategory(oldName, editingName.trim(), type);
    if (result && !('error' in result)) {
      setEditingCategoryId(null);
      onCategoriesChanged?.();
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    const result = await deleteCategory(deletingCategory.name, type);
    if (result && !('error' in result)) {
      if (category === deletingCategory.id) setCategory('');
      setDeletingCategory(null);
      onCategoriesChanged?.();
    }
  };

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
      {deletingCategory && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            onClick={() => setDeletingCategory(null)} 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass-panel w-full max-w-sm relative z-10 p-6 border border-neon-pink/30 text-center"
          >
            <div className="w-16 h-16 bg-neon-pink/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-neon-pink" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Excluir Categoria?</h3>
            <p className="text-gray-400 text-sm mb-6">
              Isso apagará permanentemente a categoria <span className="text-white font-bold">"{deletingCategory.name}"</span> e **TODAS** as transações vinculadas a ela. Tem certeza?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setDeletingCategory(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeleteCategory}
                className="px-4 py-2 rounded-xl bg-neon-pink text-black font-bold shadow-lg shadow-neon-pink/20 hover:scale-105 active:scale-95 transition-all"
              >
                Sim, Excluir
              </button>
            </div>
          </motion.div>
        </div>
      )}

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
              onClick={() => { setType('EXPENSE'); setCategory(''); setIsAddingCategory(false); setEditingCategoryId(null); }}
              type="button"
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                type === 'EXPENSE' ? "bg-neon-pink/20 text-neon-pink shadow-md border border-neon-pink/30" : "text-gray-400 hover:text-white"
              )}
            >
              Saída
            </button>
            <button
              onClick={() => { setType('INCOME'); setCategory(''); setIsAddingCategory(false); setEditingCategoryId(null); }}
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-400">Categoria</label>
                <button 
                  type="button" 
                  onClick={() => { setIsAddingCategory(true); setEditingCategoryId(null); }}
                  className="text-[10px] font-bold text-neon-blue uppercase tracking-wider hover:opacity-80 transition-opacity"
                >
                  + Nova Categoria
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {categories.map(c => {
                  const Icon = c.icon;
                  const isSelected = category === c.id;
                  const isEditing = editingCategoryId === c.id;
                  const selectedColor = type === 'INCOME' ? 'border-neon-green/50 bg-neon-green/10 text-neon-green' : 'border-neon-pink/50 bg-neon-pink/10 text-neon-pink';
                  
                  if (isEditing) {
                    return (
                      <div key={c.id} className="col-span-2 flex items-center gap-1 px-2 py-1 bg-white/5 border border-neon-blue/30 rounded-xl">
                        <input 
                          autoFocus
                          type="text"
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleUpdateCategory(c.name))}
                          className="bg-transparent border-none outline-none text-[10px] text-white w-full"
                        />
                        <button 
                          type="button" 
                          onClick={() => handleUpdateCategory(c.name)}
                          className="p-1 text-neon-green hover:bg-neon-green/10 rounded-lg transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div key={c.id} className="relative group/cat">
                      <button
                        type="button"
                        onClick={() => { setCategory(c.id); setIsAddingCategory(false); setEditingCategoryId(null); }}
                        className={cn(
                          "w-full flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all duration-200",
                          isSelected 
                            ? selectedColor
                            : "border-transparent text-gray-400 bg-white/5 hover:bg-white/10"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-[10px] font-medium truncate w-full text-center leading-none">{c.name}</span>
                      </button>
                      
                      {c.isCustom && (
                        <div className="absolute -top-1 -right-1 flex gap-1 opacity-0 group-hover/cat:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); startEditing(c); }}
                            className="w-5 h-5 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg flex items-center justify-center text-neon-blue hover:text-white transition-colors"
                          >
                            <Edit2 className="w-2.5 h-2.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setDeletingCategory(c); }}
                            className="w-5 h-5 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg flex items-center justify-center text-neon-pink hover:text-white transition-colors"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
                
                {isAddingCategory ? (
                  <div className="col-span-2 flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/20 rounded-xl">
                    <input 
                      autoFocus
                      type="text"
                      value={newCategoryName}
                      onChange={e => setNewCategoryName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                      className="bg-transparent border-none outline-none text-[10px] text-white w-full placeholder:text-gray-600"
                      placeholder="Nome..."
                    />
                    <button 
                      type="button" 
                      onClick={handleAddCategory}
                      className="p-1 text-neon-green hover:bg-neon-green/10 rounded-lg transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : null}
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
