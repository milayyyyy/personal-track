export type Currency = 'USD' | 'PHP';

export interface TransactionCategory {
  id: string;
  name: string;
}

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  color: string;
  currency: Currency;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  accountId: string;
  date: string;
  currency: Currency;
}
