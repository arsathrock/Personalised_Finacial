import React, { useState, useRef } from 'react';
import {
  Transaction,
  ThemeMode,
  Currency,
  SUPPORTED_CURRENCIES,
  PeriodFilter,
} from '../types';
import {
  exportTransactionsToCSV,
  exportTransactionsToTXT,
  exportBackupJSON,
} from '../utils/storage';
import { isInPeriod } from '../utils/formatters';
import {
  Sun,
  Moon,
  Laptop,
  Download,
  FileSpreadsheet,
  FileText,
  Upload,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

interface SettingsScreenProps {
  ledgerName: string;
  onLedgerNameChange: (name: string) => void;
  themeMode: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  incomeCategories: string[];
  expenseCategories: string[];
  onAddCategory: (type: 'income' | 'expense', cat: string) => void;
  onDeleteCategory: (type: 'income' | 'expense', cat: string) => void;
  transactions: Transaction[];
  onImportBackup: (importedData: {
    transactions: Transaction[];
    incomeCategories?: string[];
    expenseCategories?: string[];
  }) => void;
  onResetAllData: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  ledgerName,
  onLedgerNameChange,
  themeMode,
  onThemeChange,
  currency,
  onCurrencyChange,
  incomeCategories,
  expenseCategories,
  onAddCategory,
  onDeleteCategory,
  transactions,
  onImportBackup,
  onResetAllData,
}) => {
  const [ledgerInput, setLedgerInput] = useState<string>(ledgerName);
  // Export states
  const [exportPeriod, setExportPeriod] = useState<PeriodFilter>('this_month');
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  // Category management
  const [categoryType, setCategoryType] = useState<'income' | 'expense'>('expense');
  const [newCatInput, setNewCatInput] = useState<string>('');

  // Confirmation modals / prompts
  const [confirmReset, setConfirmReset] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeCategories = categoryType === 'income' ? incomeCategories : expenseCategories;

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newCatInput.trim();
    if (!val) return;
    onAddCategory(categoryType, val);
    setNewCatInput('');
  };

  const getFilteredForExport = (): Transaction[] => {
    return transactions.filter((t) => isInPeriod(t.date, exportPeriod));
  };

  const handleExportCSV = () => {
    const list = getFilteredForExport();
    exportTransactionsToCSV(list, exportPeriod);
    setExportFeedback(`Exported ${list.length} records to CSV.`);
    setTimeout(() => setExportFeedback(null), 3500);
  };

  const handleExportTXT = () => {
    const list = getFilteredForExport();
    exportTransactionsToTXT(list, currency.symbol, exportPeriod);
    setExportFeedback(`Exported ${list.length} records to TXT statement.`);
    setTimeout(() => setExportFeedback(null), 3500);
  };

  const handleBackupDownload = () => {
    exportBackupJSON(transactions, incomeCategories, expenseCategories);
    setExportFeedback('Full backup file downloaded.');
    setTimeout(() => setExportFeedback(null), 3500);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.transactions)) {
          onImportBackup({
            transactions: parsed.transactions,
            incomeCategories: parsed.incomeCategories,
            expenseCategories: parsed.expenseCategories,
          });
          setExportFeedback(`Restored ${parsed.transactions.length} transactions from backup.`);
          setTimeout(() => setExportFeedback(null), 4000);
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        console.error(err);
        alert('Could not parse backup file. Please ensure it is a valid JSON backup.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-2xl mx-auto space-y-8">
      {/* Toast Feedback */}
      {exportFeedback && (
        <div className="p-3 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200 shadow-lg">
          <Check className="w-4 h-4 text-green-400 dark:text-green-600 shrink-0" />
          <span>{exportFeedback}</span>
        </div>
      )}

      {/* 0. Ledger Title */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Ledger Name
        </h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={ledgerInput}
            onChange={(e) => setLedgerInput(e.target.value)}
            maxLength={24}
            placeholder="e.g. Ledger, Personal Account"
            className="flex-1 min-h-[44px] bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
          />
          <button
            type="button"
            onClick={() => {
              const trimmed = ledgerInput.trim();
              if (trimmed) {
                onLedgerNameChange(trimmed);
                setExportFeedback(`Ledger name changed to "${trimmed}"`);
                setTimeout(() => setExportFeedback(null), 3000);
              }
            }}
            className="min-h-[44px] px-4 bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
        </div>
      </section>

      {/* 1. Theme Appearance */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Appearance
        </h2>
        <div className="grid grid-cols-3 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => onThemeChange('light')}
            className={`min-h-[44px] flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              themeMode === 'light'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Light</span>
          </button>

          <button
            type="button"
            onClick={() => onThemeChange('dark')}
            className={`min-h-[44px] flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              themeMode === 'dark'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Dark</span>
          </button>

          <button
            type="button"
            onClick={() => onThemeChange('system')}
            className={`min-h-[44px] flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              themeMode === 'system'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>System</span>
          </button>
        </div>
      </section>

      {/* 2. Currency Selector */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Currency
        </h2>
        <div className="relative">
          <select
            value={currency.code}
            onChange={(e) => {
              const selected = SUPPORTED_CURRENCIES.find((c) => c.code === e.target.value);
              if (selected) onCurrencyChange(selected);
            }}
            aria-label="Select currency"
            className="w-full min-h-[44px] bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 text-sm font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-colors cursor-pointer"
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* 3. Reports & Export (Page 6) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Export Records
          </h2>
          <span className="text-xs text-neutral-400 dark:text-neutral-500">CSV & TXT</span>
        </div>

        <div className="p-4 bg-neutral-50/70 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-4">
          <div>
            <label
              htmlFor="export-period-select"
              className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5"
            >
              Export Date Range
            </label>
            <select
              id="export-period-select"
              value={exportPeriod}
              onChange={(e) => setExportPeriod(e.target.value as PeriodFilter)}
              className="w-full min-h-[40px] bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 text-xs font-medium text-neutral-900 dark:text-white cursor-pointer"
            >
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={handleExportCSV}
              className="min-h-[42px] px-3 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handleExportTXT}
              className="min-h-[42px] px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.99] transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Export TXT</span>
            </button>
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Export includes date, type, amount, category, and notes. Compatible with Excel, Google Sheets, and text editors.
          </p>
        </div>
      </section>

      {/* 4. Manage Categories */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Manage Categories
        </h2>

        {/* Income / Expense switcher for categories */}
        <div className="grid grid-cols-2 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => setCategoryType('expense')}
            className={`min-h-[38px] text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              categoryType === 'expense'
                ? 'bg-white dark:bg-neutral-800 text-red-600 dark:text-red-500 shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Expense Categories
          </button>
          <button
            type="button"
            onClick={() => setCategoryType('income')}
            className={`min-h-[38px] text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              categoryType === 'income'
                ? 'bg-white dark:bg-neutral-800 text-green-600 dark:text-green-500 shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Income Sources
          </button>
        </div>

        {/* Add new category inline */}
        <form onSubmit={handleCreateCategory} className="flex items-center gap-2">
          <input
            type="text"
            placeholder={`Add new ${categoryType === 'income' ? 'income source' : 'expense category'}...`}
            value={newCatInput}
            onChange={(e) => setNewCatInput(e.target.value)}
            className="flex-1 min-h-[42px] bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
          />
          <button
            type="submit"
            className="min-h-[42px] px-4 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>

        {/* Category list */}
        <div className="bg-neutral-50/50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl divide-y divide-neutral-100 dark:divide-neutral-900 max-h-56 overflow-y-auto">
          {activeCategories.map((cat) => (
            <div
              key={cat}
              className="flex items-center justify-between px-3.5 py-2.5 text-xs"
            >
              <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate pr-2">
                {cat}
              </span>
              <button
                type="button"
                onClick={() => onDeleteCategory(categoryType, cat)}
                aria-label={`Delete category ${cat}`}
                className="min-h-[32px] min-w-[32px] flex items-center justify-center text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Backup & Restore */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Data Backup & Restore
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleBackupDownload}
            className="min-h-[44px] px-3 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-900 dark:text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Backup JSON</span>
          </button>

          <label className="min-h-[44px] px-3 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-900 dark:text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center">
            <Upload className="w-4 h-4" />
            <span>Restore JSON</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>
        </div>
      </section>

      {/* 6. Reset Data */}
      <section className="space-y-3 pt-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
          Danger Zone
        </h2>

        {confirmReset ? (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold text-xs">
              <AlertCircle className="w-4 h-4" />
              <span>Erase all local transactions?</span>
            </div>
            <p className="text-[11px] text-red-700 dark:text-red-300">
              This will remove all records from this browser storage. Make sure you have exported a backup if needed.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onResetAllData();
                  setConfirmReset(false);
                  setExportFeedback('All data reset to initial state.');
                  setTimeout(() => setExportFeedback(null), 3500);
                }}
                className="flex-1 min-h-[38px] bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Confirm Erase
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="flex-1 min-h-[38px] bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="w-full min-h-[44px] border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Data</span>
          </button>
        )}
      </section>

      {/* 7. App Info */}
      <section className="pt-4 border-t border-neutral-200 dark:border-neutral-800 text-center text-xs text-neutral-400 dark:text-neutral-600 space-y-1">
        <p className="font-semibold text-neutral-600 dark:text-neutral-400">Minimal Finance Tracker v1.0</p>
        <p>Private & Offline-First · Zero Cloud Accounts Required</p>
      </section>
    </div>
  );
};
