import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import {
  X,
  Trash2,
  AlertTriangle,
  Calendar as CalendarIcon,
  AlignLeft,
  Check,
  Utensils,
  Plane,
  Gift,
  Ticket,
  ShoppingBag,
  Briefcase,
  Video,
  BookOpen,
  MoreHorizontal,
  LucideIcon,
} from 'lucide-react';

interface TransactionModalProps {
  transaction: Transaction | null;
  currencySymbol: string;
  incomeCategories: string[];
  expenseCategories: string[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updated: Transaction) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Food: Utensils,
  Travel: Plane,
  Gifts: Gift,
  Entertainment: Ticket,
  Shopping: ShoppingBag,
  'Business Expenses': Briefcase,
  Other: MoreHorizontal,
  'Digital Marketing Agency': Briefcase,
  'Video Editing': Video,
  'E-book Sales': BookOpen,
  Catering: Utensils,
  'Other Income': MoreHorizontal,
};

export const TransactionModal: React.FC<TransactionModalProps> = ({
  transaction,
  currencySymbol,
  incomeCategories,
  expenseCategories,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}) => {
  if (!isOpen || !transaction) return null;

  const [type, setType] = useState<TransactionType>(transaction.type);
  const [amount, setAmount] = useState<string>(transaction.amount.toString());
  const [date, setDate] = useState<string>(transaction.date);
  const [category, setCategory] = useState<string>(transaction.category);
  const [note, setNote] = useState<string>(transaction.note || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const categories = type === 'income' ? incomeCategories : expenseCategories;

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const newCats = newType === 'income' ? incomeCategories : expenseCategories;
    if (!newCats.includes(category)) {
      setCategory(newCats[0] || 'Other');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }
    if (!date) {
      setError('Please select a valid date');
      return;
    }

    onUpdate({
      ...transaction,
      type,
      amount: Math.round(numAmount * 100) / 100,
      date,
      category,
      note: note.trim() || undefined,
    });
    onClose();
  };

  const handleDelete = () => {
    onDelete(transaction.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white dark:bg-neutral-950 border-t sm:border border-neutral-200/80 dark:border-neutral-800 rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto p-5 sm:p-6 pb-safe shadow-2xl space-y-4">
        {/* Mobile Sheet Grab Handle */}
        <div className="w-10 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full mx-auto -mt-1 mb-2 sm:hidden" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
            Transaction Detail
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Delete Confirmation Warning state */}
        {showDeleteConfirm ? (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Delete this transaction?</span>
            </div>
            <p className="text-xs text-red-700 dark:text-red-300">
              This action cannot be undone. Are you sure you want to permanently delete this record?
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 min-h-[42px] bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Yes, Delete
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 min-h-[42px] bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-bold rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            {/* Expense / Income Toggle */}
            <div className="grid grid-cols-2 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-neutral-200/60 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`min-h-[42px] text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  type === 'expense'
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`min-h-[42px] text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  type === 'income'
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                }`}
              >
                Income
              </button>
            </div>

            {/* Amount Box Card */}
            <div className="bg-neutral-50/50 dark:bg-neutral-900/40 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-4 text-center space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                {type === 'expense' ? 'Expense Amount' : 'Income Amount'}
              </span>

              <div className="flex items-center justify-center gap-1.5">
                <span className="text-2xl sm:text-3xl font-mono font-bold text-neutral-400 select-none">
                  {currencySymbol}
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  value={amount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*\.?\d{0,2}$/.test(val) || val === '') {
                      setAmount(val);
                      if (error) setError(null);
                    }
                  }}
                  className="text-2xl sm:text-3xl font-mono font-bold text-neutral-900 dark:text-white bg-transparent border-none outline-none text-center max-w-[200px] tabular-nums"
                  required
                />
              </div>

              <div className="flex justify-center">
                {type === 'expense' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                    <span>▼</span> Debit
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <span>▲</span> Credit
                  </span>
                )}
              </div>
            </div>

            {/* Posting Date */}
            <div>
              <label
                htmlFor="edit-posting-date"
                className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1"
              >
                Posting Date
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <input
                  id="edit-posting-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full min-h-[44px] bg-white dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 rounded-xl pl-10 pr-4 text-xs font-semibold text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white transition-colors cursor-pointer"
                  required
                />
              </div>
            </div>

            {/* Category Pills */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                Category
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                {categories.map((c) => {
                  const isSelected = category === c;
                  const IconComp = CATEGORY_ICONS[c] || MoreHorizontal;
                  return (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`min-h-[34px] px-3 py-1 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950 shadow-xs'
                          : 'border-neutral-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                      <span>{c}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note */}
            <div>
              <label
                htmlFor="edit-note"
                className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1"
              >
                Note
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                  <AlignLeft className="w-4 h-4" />
                </div>
                <input
                  id="edit-note"
                  type="text"
                  placeholder="Add note (optional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={100}
                  className="w-full min-h-[44px] bg-white dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 rounded-xl pl-10 pr-4 text-xs font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white transition-colors"
                />
              </div>
            </div>

            {error && <p className="text-xs font-semibold text-red-500">{error}</p>}

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="w-full h-11 bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.99] transition-all cursor-pointer shadow-sm"
              >
                <Check className="w-4 h-4" strokeWidth={2.5} />
                <span>Save Changes</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full h-10 text-red-500 hover:text-red-600 dark:hover:text-red-400 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Transaction</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
