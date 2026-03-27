import {
  TrendingUp,
  ShoppingCart,
  Utensils,
  Home,
  Car,
  Zap,
  Coffee,
  HeartPulse,
  MonitorPlay,
  Briefcase,
  PlusCircle,
  HelpCircle,
  ShoppingBag
} from 'lucide-react';

export const CATEGORIES = {
  SALARY: { id: 'SALARY', name: 'Salário', icon: Briefcase, color: 'text-neon-green' },
  FREELANCE: { id: 'FREELANCE', name: 'Freelance', icon: TrendingUp, color: 'text-neon-green' },
  OTHER_INCOME: { id: 'OTHER_INCOME', name: 'Outros', icon: PlusCircle, color: 'text-neon-green' },
  FOOD: { id: 'FOOD', name: 'Alimentação', icon: Utensils, color: 'text-neon-pink' },
  GROCERIES: { id: 'GROCERIES', name: 'Mercado', icon: ShoppingCart, color: 'text-neon-pink' },
  SHOPPING: { id: 'SHOPPING', name: 'Compras', icon: ShoppingBag, color: 'text-neon-pink' },
  HOUSING: { id: 'HOUSING', name: 'Moradia', icon: Home, color: 'text-neon-pink' },
  TRANSPORT: { id: 'TRANSPORT', name: 'Transporte', icon: Car, color: 'text-neon-pink' },
  UTILITIES: { id: 'UTILITIES', name: 'Contas', icon: Zap, color: 'text-neon-pink' },
  HEALTH: { id: 'HEALTH', name: 'Saúde', icon: HeartPulse, color: 'text-neon-pink' },
  ENTERTAINMENT: { id: 'ENTERTAINMENT', name: 'Lazer', icon: MonitorPlay, color: 'text-neon-pink' },
  COFFEE: { id: 'COFFEE', name: 'Café', icon: Coffee, color: 'text-neon-pink' },
  OTHER_EXPENSE: { id: 'OTHER_EXPENSE', name: 'Outros', icon: HelpCircle, color: 'text-neon-pink' },
};

export const EXPENSE_CATEGORIES = Object.values(CATEGORIES).filter(c => c.id.includes('EXPENSE') || (!c.id.includes('INCOME') && c.id !== 'SALARY' && c.id !== 'FREELANCE'));
export const INCOME_CATEGORIES = Object.values(CATEGORIES).filter(c => c.id.includes('INCOME') || c.id === 'SALARY' || c.id === 'FREELANCE');
