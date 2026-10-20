import React from 'react';
import { Transaction } from '../types';
import { formatCurrency, formatRelativeDate } from '../utils/formatters';

interface TransactionRowProps {
  transaction: Transaction;
  currencySymbol: string;
  showDate?: boolean;
  onClick: (transaction: Transaction) => void;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  currencySymbol,
  showDate = false,
  onClick,
}) => {
  const isIncome = transaction.type === 'income';

  return (
    <button
      onClick={() => onClick(transaction)}
      className="w-full text-left py-3.5 px-3 -mx-3 min-h-[54px] flex items-center justify-between gap-3 rounded-xl hover:bg-neutral-100/60 dark:hover:bg-neutral-900/60 active:scale-[0.99] active:bg-neutral-200/50 dark:active:bg-neutral-800/50 transition-all border-b border-neutral-100 dark:border-neutral-900 last:border-b-0 cursor-pointer"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
          {transaction.note || transaction.category}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
          {showDate && <span>{formatRelativeDate(transaction.date)}</span>}
          {showDate && <span>·</span>}
          <span>{transaction.category}</span>
        </div>
      </div>

      <div className="text-right shrink-0">
        <span
          className={`font-mono text-sm font-bold tabular-nums tracking-tight ${
            isIncome
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-red-500'
          }`}
        >
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, currencySymbol)}
        </span>
      </div>
    </button>
  );
};
