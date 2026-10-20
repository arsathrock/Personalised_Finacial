import React from 'react';
import { Transaction, PeriodFilter } from '../types';
import { formatCurrency, isInPeriod, formatRelativeDate } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { Plus, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface HomeScreenProps {
  transactions: Transaction[];
  currencySymbol: string;
  period: PeriodFilter;
  onPeriodChange: (p: PeriodFilter) => void;
  onAddTransaction: () => void;
  onSelectTransaction: (t: Transaction) => void;
  onViewAllHistory: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  transactions,
  currencySymbol,
  period,
  onPeriodChange,
  onAddTransaction,
  onSelectTransaction,
  onViewAllHistory,
}) => {
  // Calculate total overall balance (all recorded income minus expenses)
  const totalBalance = transactions.reduce((acc, t) => {
    return t.type === 'income' ? acc + t.amount : acc - t.amount;
  }, 0);

  // Period filtered transactions for period stats
  const periodTransactions = transactions.filter((t) => isInPeriod(t.date, period));

  const periodIncome = periodTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const periodExpense = periodTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const periodNetSavings = periodIncome - periodExpense;
  const savingsRate =
    periodIncome > 0
      ? Math.round(((periodIncome - periodExpense) / periodIncome) * 1000) / 10
      : 0;

  // Recent transactions (most recent 5)
  const recentTransactions = [...transactions]
    .sort((a, b) => {
      const dateCmp = b.date.localeCompare(a.date);
      if (dateCmp !== 0) return dateCmp;
      return b.createdAt - a.createdAt;
    })
    .slice(0, 5);

  const periodOptions: { id: PeriodFilter; label: string }[] = [
    { id: 'this_month', label: 'This Month' },
    { id: 'last_month', label: 'Last Month' },
    { id: 'this_year', label: 'This Year' },
  ];

  return (
    <div className="pb-24 pt-3 px-4 max-w-2xl mx-auto space-y-4">
      {/* 1. Period Selector Tabs Pill Strip */}
      <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-neutral-200/60 dark:border-neutral-800">
        {periodOptions.map((opt) => {
          const isActive = period === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onPeriodChange(opt.id)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap text-center ${
                isActive
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* 2. Total Amount (Available Balance) - Dedicated Centered Black Box */}
      <div className="bg-neutral-950 text-white dark:bg-neutral-900 border border-neutral-900 dark:border-neutral-800 rounded-2xl p-6 shadow-md text-center space-y-3">
        {/* Header with AVAILABLE BALANCE and Live Sync badge */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Available Balance
          </span>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-neutral-300">Live Sync</span>
          </div>
        </div>

        {/* Centered Large Total Balance */}
        <div className="py-1">
          <h2 className="text-4xl sm:text-5xl font-bold font-mono tracking-tight text-white tabular-nums">
            {formatCurrency(totalBalance, currencySymbol)}
          </h2>
        </div>

        {/* Period Net Savings inside the Total Box */}
        <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs">
          <span className="text-neutral-400 font-medium">Period Net Savings</span>
          <span
            className={`font-mono font-bold tabular-nums ${
              periodNetSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {periodNetSavings >= 0 ? '+' : '-'}{formatCurrency(periodNetSavings, currencySymbol)}
            {periodIncome > 0 && (
              <span className="text-[11px] font-medium ml-1 text-neutral-300">
                ({savingsRate >= 0 ? `+${savingsRate}%` : `${savingsRate}%`})
              </span>
            )}
          </span>
        </div>
      </div>

      {/* 3. Separate Dedicated Boxes: Total Income (GREEN) & Total Expense (RED) */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Total Income Box (GREEN COLOR) */}
        <div className="bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4 shadow-xs space-y-1.5 transition-all">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center shrink-0">
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
            </div>
            <span className="truncate">Total Income</span>
          </div>
          <div>
            <span className="text-lg sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums block">
              +{formatCurrency(periodIncome, currencySymbol)}
            </span>
          </div>
        </div>

        {/* Total Expense Box (RED COLOR) */}
        <div className="bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl p-4 shadow-xs space-y-1.5 transition-all">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-300">
            <div className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" strokeWidth={2.5} />
            </div>
            <span className="truncate">Total Expense</span>
          </div>
          <div>
            <span className="text-lg sm:text-2xl font-bold font-mono text-red-500 dark:text-red-400 tabular-nums block">
              -{formatCurrency(periodExpense, currencySymbol)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Primary Full-Width Action: + Add Transaction */}
      <button
        onClick={onAddTransaction}
        className="w-full h-12 bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 font-bold text-sm rounded-xl flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer shadow-sm"
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        <span>Add Transaction</span>
      </button>

      {/* 4. Recent Transactions Section */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
            Recent Transactions
          </h3>
          {transactions.length > 0 && (
            <button
              onClick={onViewAllHistory}
              className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
            >
              View All
            </button>
          )}
        </div>

        {recentTransactions.length === 0 ? (
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl py-12 text-center text-sm text-neutral-400 dark:text-neutral-600">
            No transactions recorded yet.
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl divide-y divide-neutral-100 dark:divide-neutral-900 overflow-hidden shadow-xs">
            {recentTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              return (
                <button
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx)}
                  className="w-full text-left p-3.5 flex items-center justify-between gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 active:bg-neutral-100/60 dark:active:bg-neutral-800/60 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <CategoryIcon category={tx.category} type={tx.type} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                        {tx.note || tx.category}
                      </p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate mt-0.5">
                        {formatRelativeDate(tx.date)}
                        {tx.note && <span> · {tx.category}</span>}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`block font-mono text-sm font-bold tabular-nums tracking-tight ${
                        isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                      }`}
                    >
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currencySymbol)}
                    </span>
                    <span className="block text-[11px] font-medium text-neutral-400 dark:text-neutral-500 mt-0.5">
                      {isIncome ? 'Received' : 'Cleared'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
