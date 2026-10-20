import React, { useState } from 'react';
import { Transaction, PeriodFilter } from '../types';
import { formatCurrency, formatRelativeDate, isInPeriod } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { SlidersHorizontal, ChevronRight } from 'lucide-react';

interface HistoryScreenProps {
  transactions: Transaction[];
  currencySymbol: string;
  incomeCategories: string[];
  expenseCategories: string[];
  onSelectTransaction: (t: Transaction) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  transactions,
  currencySymbol,
  incomeCategories,
  expenseCategories,
  onSelectTransaction,
}) => {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('this_month');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Filtered transactions
  const filtered = transactions.filter((t) => {
    if (!isInPeriod(t.date, periodFilter)) return false;
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    const cmp = sortOrder === 'desc' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date);
    if (cmp !== 0) return cmp;
    return sortOrder === 'desc' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt;
  });

  // Group by date
  const groupedByDate: { date: string; items: Transaction[]; dayIncome: number; dayExpense: number }[] = [];
  sorted.forEach((item) => {
    let group = groupedByDate.find((g) => g.date === item.date);
    if (!group) {
      group = { date: item.date, items: [], dayIncome: 0, dayExpense: 0 };
      groupedByDate.push(group);
    }
    group.items.push(item);
    if (item.type === 'income') group.dayIncome += item.amount;
    else group.dayExpense += item.amount;
  });

  const totalFilteredIncome = filtered
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredExpense = filtered
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredNet = totalFilteredIncome - totalFilteredExpense;
  const retainedRate =
    totalFilteredIncome > 0
      ? Math.round(((totalFilteredIncome - totalFilteredExpense) / totalFilteredIncome) * 100)
      : 0;

  const allAvailableCategories = Array.from(
    new Set([...expenseCategories, ...incomeCategories])
  );

  return (
    <div className="pb-24 pt-3 px-4 max-w-2xl mx-auto space-y-4">
      {/* 1. Period Pills Scroller */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'this_month' as PeriodFilter, label: 'This Month' },
          { id: 'last_month' as PeriodFilter, label: 'Last Month' },
          { id: 'this_year' as PeriodFilter, label: 'This Year' },
          { id: 'all' as PeriodFilter, label: 'All Time' },
        ].map((p) => {
          const isActive = periodFilter === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setPeriodFilter(p.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* 2. Type & Category Filter Pills Scroller */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {/* All pill with total count */}
        <button
          onClick={() => {
            setTypeFilter('all');
            setCategoryFilter('all');
          }}
          className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-all cursor-pointer ${
            typeFilter === 'all' && categoryFilter === 'all'
              ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
              : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400'
          }`}
        >
          All {transactions.length}
        </button>

        {/* Income filter pill */}
        <button
          onClick={() => setTypeFilter((curr) => (curr === 'income' ? 'all' : 'income'))}
          className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
            typeFilter === 'income'
              ? 'bg-emerald-600 text-white'
              : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Income</span>
        </button>

        {/* Expense filter pill */}
        <button
          onClick={() => setTypeFilter((curr) => (curr === 'expense' ? 'all' : 'expense'))}
          className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
            typeFilter === 'expense'
              ? 'bg-red-500 text-white'
              : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <span>Expense</span>
        </button>

        {/* Individual category pills */}
        {allAvailableCategories.slice(0, 6).map((c) => {
          const isActive = categoryFilter === c;
          return (
            <button
              key={c}
              onClick={() => setCategoryFilter((curr) => (curr === c ? 'all' : c))}
              className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
                  : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      {/* 3. Filtered Net Yield Banner */}
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-0.5">
            Filtered Net Yield
          </span>
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-xl sm:text-2xl font-bold tabular-nums ${
                filteredNet >= 0 ? 'text-neutral-900 dark:text-white' : 'text-red-500'
              }`}
            >
              {filteredNet >= 0 ? '+' : '-'}{formatCurrency(filteredNet, currencySymbol)}
            </span>
            {totalFilteredIncome > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                {retainedRate}% retained
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => setSortOrder((curr) => (curr === 'desc' ? 'asc' : 'desc'))}
          aria-label="Toggle sort direction"
          className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* 4. Transactions Grouped by Date */}
      {groupedByDate.length === 0 ? (
        <div className="bg-white dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl py-16 text-center text-sm text-neutral-400 dark:text-neutral-600">
          {transactions.length === 0
            ? 'No transactions recorded yet.'
            : 'No transactions match this filter.'}
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByDate.map((group) => {
            const dayNet = group.dayIncome - group.dayExpense;
            return (
              <div key={group.date} className="space-y-1.5">
                {/* Date Group Header */}
                <div className="flex items-center justify-between px-1 text-xs">
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">
                    {formatRelativeDate(group.date)}
                  </span>
                  <span
                    className={`font-mono font-bold text-[11px] tabular-nums ${
                      dayNet >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                    }`}
                  >
                    {dayNet >= 0 ? '+' : '-'}{formatCurrency(dayNet, currencySymbol)}
                  </span>
                </div>

                {/* Items Container */}
                <div className="bg-white dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl divide-y divide-neutral-100 dark:divide-neutral-900 overflow-hidden shadow-xs">
                  {group.items.map((tx) => {
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
                              {tx.category}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`font-mono text-sm font-bold tabular-nums tracking-tight ${
                              isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                            }`}
                          >
                            {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currencySymbol)}
                          </span>
                          <ChevronRight className="w-4 h-4 text-neutral-400" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
