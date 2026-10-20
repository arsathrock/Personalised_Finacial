import { useState, useEffect, useCallback } from 'react';
import {
  Transaction,
  TransactionType,
  ThemeMode,
  Currency,
  PeriodFilter,
} from './types';
import {
  getStoredTransactions,
  saveTransactions,
  getStoredCategories,
  saveCategories,
  getStoredTheme,
  saveStoredTheme,
  getStoredCurrency,
  saveStoredCurrency,
  getStoredLedgerName,
  saveStoredLedgerName,
} from './utils/storage';
import { Header } from './components/Header';
import { BottomNav, MainTab } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { CalendarScreen } from './components/CalendarScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { AddTransactionScreen } from './components/AddTransactionScreen';
import { TransactionModal } from './components/TransactionModal';
import { SettingsScreen } from './components/SettingsScreen';

type ActiveView = 'tabs' | 'add' | 'settings';

export default function App() {
  // Primary state
  const [ledgerName, setLedgerName] = useState<string>(() => getStoredLedgerName());
  const [transactions, setTransactions] = useState<Transaction[]>(() => getStoredTransactions());
  const [incomeCategories, setIncomeCategories] = useState<string[]>(() =>
    getStoredCategories('income')
  );
  const [expenseCategories, setExpenseCategories] = useState<string[]>(() =>
    getStoredCategories('expense')
  );
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => getStoredTheme());
  const [currency, setCurrency] = useState<Currency>(() => getStoredCurrency());

  // Navigation state
  const [currentTab, setCurrentTab] = useState<MainTab>('home');
  const [activeView, setActiveView] = useState<ActiveView>('tabs');
  const [homePeriod, setHomePeriod] = useState<PeriodFilter>('this_month');

  // Modals & Date passing
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [addTransactionDate, setAddTransactionDate] = useState<string | undefined>(undefined);

  // Sync theme with DOM and system preferences
  const applyTheme = useCallback((mode: ThemeMode) => {
    const isDark =
      mode === 'dark' ||
      (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    applyTheme(themeMode);
    saveStoredTheme(themeMode);

    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [themeMode, applyTheme]);

  // Handlers for Transactions
  const handleSaveNewTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'>
  ) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: Date.now(),
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    saveTransactions(updated);
    setActiveView('tabs');
    setAddTransactionDate(undefined);
  };

  const handleUpdateTransaction = (updatedTx: Transaction) => {
    const updated = transactions.map((t) => (t.id === updatedTx.id ? updatedTx : t));
    setTransactions(updated);
    saveTransactions(updated);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    saveTransactions(updated);
  };

  // Handlers for Categories
  const handleAddCategory = (type: TransactionType, newCat: string) => {
    const targetCats = type === 'income' ? incomeCategories : expenseCategories;
    if (targetCats.includes(newCat)) return;

    const updated = [...targetCats, newCat];
    if (type === 'income') {
      setIncomeCategories(updated);
      saveCategories('income', updated);
    } else {
      setExpenseCategories(updated);
      saveCategories('expense', updated);
    }
  };

  const handleDeleteCategory = (type: 'income' | 'expense', catToDelete: string) => {
    const targetCats = type === 'income' ? incomeCategories : expenseCategories;
    const updated = targetCats.filter((c) => c !== catToDelete);
    if (type === 'income') {
      setIncomeCategories(updated);
      saveCategories('income', updated);
    } else {
      setExpenseCategories(updated);
      saveCategories('expense', updated);
    }
  };

  // Currency handler
  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    saveStoredCurrency(newCurrency);
  };

  // Ledger Name handler
  const handleUpdateLedgerName = (newName: string) => {
    setLedgerName(newName);
    saveStoredLedgerName(newName);
  };

  // Backup Import handler
  const handleImportBackup = (imported: {
    transactions: Transaction[];
    incomeCategories?: string[];
    expenseCategories?: string[];
  }) => {
    setTransactions(imported.transactions);
    saveTransactions(imported.transactions);
    if (imported.incomeCategories && imported.incomeCategories.length > 0) {
      setIncomeCategories(imported.incomeCategories);
      saveCategories('income', imported.incomeCategories);
    }
    if (imported.expenseCategories && imported.expenseCategories.length > 0) {
      setExpenseCategories(imported.expenseCategories);
      saveCategories('expense', imported.expenseCategories);
    }
  };

  // Reset handler
  const handleResetAllData = () => {
    localStorage.clear();
    setTransactions([]);
    setLedgerName('Ledger');
    saveStoredLedgerName('Ledger');
    const defIncome = getStoredCategories('income');
    const defExpense = getStoredCategories('expense');
    setIncomeCategories(defIncome);
    setExpenseCategories(defExpense);
  };

  // Title for top bar
  const getHeaderTitle = (): string => {
    if (activeView === 'add') return 'Add Transaction';
    if (activeView === 'settings') return 'Settings & Export';
    if (currentTab === 'home') return 'Finance';
    if (currentTab === 'calendar') return 'Calendar';
    if (currentTab === 'history') return 'Transaction History';
    return 'Finance';
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-150">
      {/* Persistent Minimal Header */}
      <Header
        ledgerName={ledgerName}
        onUpdateLedgerName={handleUpdateLedgerName}
        sectionSubtitle={
          currentTab === 'home'
            ? 'HOME'
            : currentTab === 'calendar'
            ? 'CALENDAR'
            : 'HISTORY'
        }
        detailTitle={
          activeView === 'add'
            ? 'Transaction Detail'
            : activeView === 'settings'
            ? 'Settings & Export'
            : undefined
        }
        showBack={activeView !== 'tabs'}
        onBack={() => {
          setActiveView('tabs');
          setAddTransactionDate(undefined);
        }}
        onOpenSettings={() => setActiveView('settings')}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 w-full max-w-2xl mx-auto">
        {activeView === 'add' ? (
          <AddTransactionScreen
            currencySymbol={currency.symbol}
            incomeCategories={incomeCategories}
            expenseCategories={expenseCategories}
            onAddCustomCategory={handleAddCategory}
            onSave={handleSaveNewTransaction}
            initialDate={addTransactionDate}
          />
        ) : activeView === 'settings' ? (
          <SettingsScreen
            ledgerName={ledgerName}
            onLedgerNameChange={handleUpdateLedgerName}
            themeMode={themeMode}
            onThemeChange={setThemeMode}
            currency={currency}
            onCurrencyChange={handleCurrencyChange}
            incomeCategories={incomeCategories}
            expenseCategories={expenseCategories}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            transactions={transactions}
            onImportBackup={handleImportBackup}
            onResetAllData={handleResetAllData}
          />
        ) : (
          <>
            {currentTab === 'home' && (
              <HomeScreen
                transactions={transactions}
                currencySymbol={currency.symbol}
                period={homePeriod}
                onPeriodChange={setHomePeriod}
                onAddTransaction={() => {
                  setAddTransactionDate(undefined);
                  setActiveView('add');
                }}
                onSelectTransaction={(tx) => setEditingTransaction(tx)}
                onViewAllHistory={() => setCurrentTab('history')}
              />
            )}

            {currentTab === 'calendar' && (
              <CalendarScreen
                transactions={transactions}
                currencySymbol={currency.symbol}
                onSelectTransaction={(tx) => setEditingTransaction(tx)}
                onAddTransactionForDate={(dateStr) => {
                  setAddTransactionDate(dateStr);
                  setActiveView('add');
                }}
              />
            )}

            {currentTab === 'history' && (
              <HistoryScreen
                transactions={transactions}
                currencySymbol={currency.symbol}
                incomeCategories={incomeCategories}
                expenseCategories={expenseCategories}
                onSelectTransaction={(tx) => setEditingTransaction(tx)}
              />
            )}
          </>
        )}
      </main>

      {/* Primary 3-Tab Bottom Navigation (Only visible on main tab screens) */}
      {activeView === 'tabs' && (
        <BottomNav
          currentTab={currentTab}
          onTabChange={(tab) => {
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'instant' });
          }}
        />
      )}

      {/* Transaction Details & Edit Modal */}
      <TransactionModal
        isOpen={editingTransaction !== null}
        transaction={editingTransaction}
        currencySymbol={currency.symbol}
        incomeCategories={incomeCategories}
        expenseCategories={expenseCategories}
        onClose={() => setEditingTransaction(null)}
        onUpdate={handleUpdateTransaction}
        onDelete={handleDeleteTransaction}
      />
    </div>
  );
}
