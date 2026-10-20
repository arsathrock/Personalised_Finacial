import {
  Transaction,
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORIES,
  ThemeMode,
  SUPPORTED_CURRENCIES,
  Currency,
} from '../types';

const TRANSACTIONS_KEY = 'mft_transactions_v1';
const INCOME_CATEGORIES_KEY = 'mft_income_categories_v1';
const EXPENSE_CATEGORIES_KEY = 'mft_expense_categories_v1';
const THEME_KEY = 'mft_theme_mode_v1';
const CURRENCY_KEY = 'mft_currency_v1';
const LEDGER_NAME_KEY = 'mft_ledger_name_v1';

export function getStoredTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Remove any previously stored mock/seed records
      const realOnly = parsed.filter((t: Transaction) => !t.id?.startsWith('tx_seed_'));
      if (realOnly.length !== parsed.length) {
        localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(realOnly));
      }
      return realOnly;
    }
    return [];
  } catch (e) {
    console.error('Failed to parse transactions from localStorage', e);
    return [];
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (e) {
    console.error('Failed to save transactions to localStorage', e);
  }
}

export function getStoredCategories(type: 'income' | 'expense'): string[] {
  const key = type === 'income' ? INCOME_CATEGORIES_KEY : EXPENSE_CATEGORIES_KEY;
  const defaultList = type === 'income' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultList));
      return defaultList;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to load ${type} categories`, e);
    return defaultList;
  }
}

export function saveCategories(type: 'income' | 'expense', categories: string[]): void {
  const key = type === 'income' ? INCOME_CATEGORIES_KEY : EXPENSE_CATEGORIES_KEY;
  try {
    localStorage.setItem(key, JSON.stringify(categories));
  } catch (e) {
    console.error(`Failed to save ${type} categories`, e);
  }
}

export function getStoredTheme(): ThemeMode {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'system') {
      return raw;
    }
    return 'system';
  } catch {
    return 'system';
  }
}

export function saveStoredTheme(mode: ThemeMode): void {
  try {
    localStorage.setItem(THEME_KEY, mode);
  } catch (e) {
    console.error('Failed to save theme', e);
  }
}

export function getStoredCurrency(): Currency {
  try {
    const raw = localStorage.getItem(CURRENCY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.symbol) return parsed;
    }
  } catch {}
  return SUPPORTED_CURRENCIES[0]; // $ by default
}

export function saveStoredCurrency(currency: Currency): void {
  try {
    localStorage.setItem(CURRENCY_KEY, JSON.stringify(currency));
  } catch (e) {
    console.error('Failed to save currency', e);
  }
}

export function getStoredLedgerName(): string {
  try {
    const raw = localStorage.getItem(LEDGER_NAME_KEY);
    if (raw && raw.trim()) return raw.trim();
  } catch {}
  return 'Ledger';
}

export function saveStoredLedgerName(name: string): void {
  try {
    localStorage.setItem(LEDGER_NAME_KEY, name.trim() || 'Ledger');
  } catch (e) {
    console.error('Failed to save ledger name', e);
  }
}

export function exportTransactionsToCSV(transactions: Transaction[], dateLabel: string = 'export'): void {
  const headers = ['Date', 'Type', 'Amount', 'Category', 'Note'];
  const rows = transactions.map((t) => [
    t.date,
    t.type.toUpperCase(),
    t.amount.toFixed(2),
    `"${(t.category || '').replace(/"/g, '""')}"`,
    `"${(t.note || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `finance_transactions_${dateLabel}.csv`);
}

export function exportTransactionsToTXT(
  transactions: Transaction[],
  currencySymbol: string,
  dateLabel: string = 'export'
): void {
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((t) => {
    if (t.type === 'income') totalIncome += t.amount;
    else totalExpense += t.amount;
  });

  const netBalance = totalIncome - totalExpense;

  let txt = `=================================================\n`;
  txt += `PERSONAL FINANCE TRACKER — STATEMENT SUMMARY\n`;
  txt += `Generated: ${new Date().toISOString().split('T')[0]}\n`;
  txt += `Scope: ${dateLabel}\n`;
  txt += `=================================================\n\n`;
  txt += `SUMMARY\n`;
  txt += `-------------------------------------------------\n`;
  txt += `Total Income:   +${currencySymbol}${totalIncome.toFixed(2)}\n`;
  txt += `Total Expenses: -${currencySymbol}${totalExpense.toFixed(2)}\n`;
  txt += `Net Balance:     ${netBalance >= 0 ? '+' : '-'}${currencySymbol}${Math.abs(netBalance).toFixed(2)}\n`;
  txt += `Total Records:   ${transactions.length}\n`;
  txt += `=================================================\n\n`;
  txt += `TRANSACTION RECORDS\n`;
  txt += `-------------------------------------------------\n`;

  if (transactions.length === 0) {
    txt += `No transactions in this period.\n`;
  } else {
    // Sort descending by date
    const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
    sorted.forEach((t, i) => {
      const sign = t.type === 'income' ? '(+) INCOME ' : '(-) EXPENSE';
      const formattedAmount = `${currencySymbol}${t.amount.toFixed(2)}`;
      txt += `[${i + 1}] ${t.date} | ${sign.padEnd(11)} | ${formattedAmount.padStart(10)} | ${t.category}\n`;
      if (t.note) {
        txt += `    Note: ${t.note}\n`;
      }
    });
  }

  txt += `\n=================================================\n`;
  txt += `END OF STATEMENT\n`;

  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
  triggerDownload(blob, `finance_statement_${dateLabel}.txt`);
}

export function exportBackupJSON(transactions: Transaction[], incomeCats: string[], expenseCats: string[]): void {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    transactions,
    incomeCategories: incomeCats,
    expenseCategories: expenseCats,
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  triggerDownload(blob, `finance_tracker_backup_${new Date().toISOString().split('T')[0]}.json`);
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
