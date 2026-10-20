export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO date string YYYY-MM-DD
  category: string;
  note?: string;
  createdAt: number; // timestamp
}

export type PeriodFilter = 'this_month' | 'last_month' | 'this_year' | 'all';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Currency {
  symbol: string;
  code: string;
  name: string;
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  { symbol: '$', code: 'USD', name: 'US Dollar ($)' },
  { symbol: '₹', code: 'INR', name: 'Indian Rupee (₹)' },
  { symbol: '€', code: 'EUR', name: 'Euro (€)' },
  { symbol: '£', code: 'GBP', name: 'British Pound (£)' },
  { symbol: '¥', code: 'JPY', name: 'Japanese Yen (¥)' },
  { symbol: 'A$', code: 'AUD', name: 'Australian Dollar (A$)' },
  { symbol: 'C$', code: 'CAD', name: 'Canadian Dollar (C$)' },
  { symbol: 'AED', code: 'AED', name: 'UAE Dirham (AED)' },
  { symbol: 'S$', code: 'SGD', name: 'Singapore Dollar (S$)' },
];

export const DEFAULT_INCOME_CATEGORIES: string[] = [
  'Video Editing',
  'Digital Marketing Agency',
  'E-book Sales',
  'Catering',
  'Other Income',
];

export const DEFAULT_EXPENSE_CATEGORIES: string[] = [
  'Food',
  'Travel',
  'Gifts',
  'Entertainment',
  'Shopping',
  'Business Expenses',
  'Other',
];
