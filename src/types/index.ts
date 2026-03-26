export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  amount: number;
  date: string; // ISO YYYY-MM-DD
  description: string;
  category: string; // id da categoria
  type: TransactionType;
}

export interface MonthlyStats {
  income: number;
  expense: number;
  balance: number;
}
