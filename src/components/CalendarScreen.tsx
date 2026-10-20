import React, { useState } from 'react';
import { Transaction } from '../types';
import { formatCurrency, formatFullDate, getMonthLabel } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, TrendingUp, Plus } from 'lucide-react';

interface CalendarScreenProps {
  transactions: Transaction[];
  currencySymbol: string;
  onSelectTransaction: (t: Transaction) => void;
  onAddTransactionForDate: (dateStr: string) => void;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({
  transactions,
  currencySymbol,
  onSelectTransaction,
  onAddTransactionForDate,
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-11

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Build calendar matrix (Monday as first day of week, standard in European/fintech calendars)
  // Get day of week for 1st of month: 0 (Sun) - 6 (Sat)
  const firstDaySunBased = new Date(currentYear, currentMonth, 1).getDay();
  // Convert to Mon=0 ... Sun=6
  const firstDayMonBased = firstDaySunBased === 0 ? 6 : firstDaySunBased - 1;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Transactions by date map
  const txByDate: Record<
    string,
    { hasIncome: boolean; hasExpense: boolean; incomeTotal: number; expenseTotal: number; count: number }
  > = {};

  let monthTotalIncome = 0;
  let monthTotalExpense = 0;

  transactions.forEach((tx) => {
    const [tYear, tMonth] = tx.date.split('-').map(Number);
    if (tYear === currentYear && tMonth === currentMonth + 1) {
      if (tx.type === 'income') monthTotalIncome += tx.amount;
      else monthTotalExpense += tx.amount;
    }

    if (!txByDate[tx.date]) {
      txByDate[tx.date] = { hasIncome: false, hasExpense: false, incomeTotal: 0, expenseTotal: 0, count: 0 };
    }
    txByDate[tx.date].count += 1;
    if (tx.type === 'income') {
      txByDate[tx.date].hasIncome = true;
      txByDate[tx.date].incomeTotal += tx.amount;
    } else {
      txByDate[tx.date].hasExpense = true;
      txByDate[tx.date].expenseTotal += tx.amount;
    }
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const dayHeaders = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Days array for grid
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayMonBased; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  // Selected date transactions
  const selectedDayTransactions = transactions
    .filter((tx) => tx.date === selectedDate)
    .sort((a, b) => b.createdAt - a.createdAt);

  const selectedDayIncome = selectedDayTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const selectedDayExpense = selectedDayTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const selectedDayNet = selectedDayIncome - selectedDayExpense;

  // Active tracking days count this month
  const activeDaysThisMonth = Object.keys(txByDate).filter((dateStr) => {
    const [y, m] = dateStr.split('-').map(Number);
    return y === currentYear && m === currentMonth + 1;
  }).length;

  return (
    <div className="pb-24 pt-3 px-4 max-w-2xl mx-auto space-y-4">
      {/* 1. Calendar Month Card */}
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-5 shadow-xs space-y-4">
        {/* Month Navigation & Subtitle */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevMonth}
            aria-label="Previous month"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="text-center">
            <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <p className="text-[11px] font-medium text-neutral-400 mt-0.5">
              {daysInMonth} Days · {monthTotalIncome >= monthTotalExpense ? 'Balanced' : 'Deficit'}
            </p>
          </div>

          <button
            onClick={nextMonth}
            aria-label="Next month"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Month Income & Out Summary Badges */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800 rounded-xl p-2.5 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>In</span>
            </div>
            <span className="font-mono text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              +{formatCurrency(monthTotalIncome, currencySymbol)}
            </span>
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800 rounded-xl p-2.5 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span>Out</span>
            </div>
            <span className="font-mono text-xs sm:text-sm font-bold text-red-500 tabular-nums">
              -{formatCurrency(monthTotalExpense, currencySymbol)}
            </span>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 text-center pt-1 border-t border-neutral-100 dark:border-neutral-900">
          {dayHeaders.map((dh, idx) => (
            <div key={idx} className="text-[11px] font-bold text-neutral-400 py-1">
              {dh}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-1 gap-x-1">
          {cells.map((dayNum, index) => {
            if (dayNum === null) {
              return <div key={`empty-${index}`} className="h-10 sm:h-11" />;
            }

            const dayDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isSelected = selectedDate === dayDateStr;
            const isToday = todayStr === dayDateStr;
            const info = txByDate[dayDateStr];

            return (
              <button
                key={dayDateStr}
                onClick={() => setSelectedDate(dayDateStr)}
                className={`h-10 sm:h-11 w-full rounded-xl flex flex-col items-center justify-center relative transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-bold shadow-xs'
                    : isToday
                    ? 'border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white font-semibold'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900'
                }`}
              >
                <span className="text-xs sm:text-sm font-medium tabular-nums">{dayNum}</span>

                {/* Subtle indicators underneath */}
                {info && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {info.hasIncome && (
                      <span
                        className={`w-1 h-1 rounded-full ${
                          isSelected ? 'bg-emerald-400 dark:bg-emerald-600' : 'bg-emerald-500'
                        }`}
                      />
                    )}
                    {info.hasExpense && (
                      <span
                        className={`w-1 h-1 rounded-full ${
                          isSelected ? 'bg-red-400 dark:bg-red-600' : 'bg-red-500'
                        }`}
                      />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Selected Day Transactions Section */}
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-5 shadow-xs space-y-3">
        {/* Header row */}
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-900">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-neutral-400" />
            <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
              Transactions for {formatFullDate(selectedDate)}
            </h3>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400">
            {selectedDayTransactions.length} {selectedDayTransactions.length === 1 ? 'Entry' : 'Entries'}
          </span>
        </div>

        {/* Day Net Yield */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Day Net Yield
          </span>
          <span
            className={`font-mono text-sm font-bold tabular-nums ${
              selectedDayNet >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-500'
            }`}
          >
            {selectedDayNet >= 0 ? '+' : '-'}{formatCurrency(selectedDayNet, currencySymbol)}
          </span>
        </div>

        {/* Transaction list */}
        {selectedDayTransactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-400 dark:text-neutral-600 flex flex-col items-center gap-2">
            <span>No transactions logged for this day.</span>
            <button
              onClick={() => onAddTransactionForDate(selectedDate)}
              className="text-xs font-bold text-neutral-900 dark:text-white hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add for this date</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-900 pt-1">
            {selectedDayTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              return (
                <button
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx)}
                  className="w-full text-left py-3 flex items-center justify-between gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 rounded-lg px-1 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <CategoryIcon category={tx.category} type={tx.type} size={16} className="w-9 h-9 rounded-xl" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                        {tx.note || tx.category}
                      </p>
                      <p className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate mt-0.5">
                        {tx.category}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`block font-mono text-xs sm:text-sm font-bold tabular-nums ${
                        isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                      }`}
                    >
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currencySymbol)}
                    </span>
                    <span className="block text-[10px] font-medium text-neutral-400 mt-0.5">
                      {isIncome ? 'Received' : 'Cleared'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Bottom Insight Card */}
      <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
              {activeDaysThisMonth} Tracking Days This Month
            </h4>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
              Accurate logs maintained across your statements.
            </p>
          </div>
        </div>
        <button
          onClick={() => onAddTransactionForDate(todayStr)}
          className="text-xs font-bold text-emerald-900 dark:text-emerald-300 hover:underline shrink-0 cursor-pointer"
        >
          + Add
        </button>
      </div>
    </div>
  );
};
