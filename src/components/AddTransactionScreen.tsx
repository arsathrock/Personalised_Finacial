import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { getTodayString, formatFullDate } from '../utils/formatters';
import {
  Calendar as CalendarIcon,
  Plus,
  Check,
  AlignLeft,
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

interface AddTransactionScreenProps {
  currencySymbol: string;
  incomeCategories: string[];
  expenseCategories: string[];
  onAddCustomCategory: (type: TransactionType, newCat: string) => void;
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  initialDate?: string;
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

export const AddTransactionScreen: React.FC<AddTransactionScreenProps> = ({
  currencySymbol,
  incomeCategories,
  expenseCategories,
  onAddCustomCategory,
  onSave,
  initialDate,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('45.00');
  const [date, setDate] = useState<string>(initialDate || getTodayString());
  const [selectedCategory, setSelectedCategory] = useState<string>('Food');
  const [note, setNote] = useState<string>('');
  
  const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false);
  const [customCatInput, setCustomCatInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const categories = type === 'income' ? incomeCategories : expenseCategories;

  const activeCategory =
    selectedCategory && categories.includes(selectedCategory)
      ? selectedCategory
      : categories[0] || '';

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setIsAddingCategory(false);
    setCustomCatInput('');
    setError(null);
    const newCats = newType === 'income' ? incomeCategories : expenseCategories;
    setSelectedCategory(newCats[0] || '');
  };

  const handleCreateCustomCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customCatInput.trim();
    if (!trimmed) return;
    onAddCustomCategory(type, trimmed);
    setSelectedCategory(trimmed);
    setCustomCatInput('');
    setIsAddingCategory(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    if (!date) {
      setError('Please select a posting date');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    onSave({
      type,
      amount: Math.round(numAmount * 100) / 100,
      date,
      category: activeCategory || 'Other',
      note: note.trim() || undefined,
    });
  };

  return (
    <div className="pb-28 pt-3 px-4 max-w-2xl mx-auto">
      <form onSubmit={handleSave} className="space-y-5">
        {/* Top 2-Segment Switch: Expense / Income */}
        <div className="grid grid-cols-2 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-2xl border border-neutral-200/60 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`min-h-[46px] text-xs font-bold rounded-xl transition-all cursor-pointer ${
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
            className={`min-h-[46px] text-xs font-bold rounded-xl transition-all cursor-pointer ${
              type === 'income'
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Income
          </button>
        </div>

        {/* Amount Box Card */}
        <div className="bg-white dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 text-center shadow-xs space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">
            {type === 'expense' ? 'Expense Amount' : 'Income Amount'}
          </span>

          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl sm:text-4xl font-mono font-bold text-neutral-400 dark:text-neutral-500 select-none">
              {currencySymbol}
            </span>
            <input
              type="text"
              inputMode="decimal"
              pattern="[0-9]*[.,]?[0-9]*"
              autoFocus
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                const val = e.target.value;
                // Allow only numbers and a single decimal point
                if (/^\d*\.?\d{0,2}$/.test(val) || val === '') {
                  setAmount(val);
                  if (error) setError(null);
                }
              }}
              className="text-3xl sm:text-4xl font-mono font-bold text-neutral-900 dark:text-white bg-transparent border-none outline-none text-center max-w-[200px] sm:max-w-[260px] tabular-nums"
              required
            />
          </div>

          {/* Quick Phone Preset Amount Chips */}
          <div className="flex items-center justify-center gap-1.5 pt-1 overflow-x-auto no-scrollbar py-1">
            {[100, 500, 1000, 2000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  const current = parseFloat(amount) || 0;
                  setAmount((current + preset).toFixed(2));
                  if (error) setError(null);
                }}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 active:scale-[0.95] transition-all cursor-pointer whitespace-nowrap"
              >
                +{preset}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setAmount('');
                if (error) setError(null);
              }}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-neutral-100 dark:bg-neutral-900 text-neutral-400 hover:text-red-500 active:scale-[0.95] transition-all cursor-pointer"
            >
              Clear
            </button>
          </div>

          {/* Debit / Credit Tag */}
          <div className="flex justify-center pt-0.5">
            {type === 'expense' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                <span>▼</span> Debit
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <span>▲</span> Credit
              </span>
            )}
          </div>
        </div>

        {/* Posting Date */}
        <div>
          <label
            htmlFor="posting-date"
            className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1.5"
          >
            Posting Date
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <input
              id="posting-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full min-h-[48px] bg-white dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 rounded-xl pl-10 pr-4 text-xs font-semibold text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white transition-colors cursor-pointer"
              required
            />
          </div>
        </div>

        {/* Category Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Category
            </label>
            <span className="text-[11px] text-neutral-400">Select one</span>
          </div>

          {/* Custom category input inline */}
          {isAddingCategory && (
            <div className="mb-3 flex items-center gap-2">
              <input
                type="text"
                autoFocus
                placeholder="Category name"
                value={customCatInput}
                onChange={(e) => setCustomCatInput(e.target.value)}
                className="flex-1 min-h-[42px] bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
              />
              <button
                type="button"
                onClick={handleCreateCustomCategory}
                className="min-h-[42px] px-3.5 bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Add
              </button>
              <button
                type="button"
                onClick={() => setIsAddingCategory(false)}
                className="min-h-[42px] px-3 text-xs text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Pills with Category Icons */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isSelected = activeCategory === cat;
              const IconComp = CATEGORY_ICONS[cat] || MoreHorizontal;
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`min-h-[38px] px-3.5 py-1.5 text-xs font-semibold rounded-xl border flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950 shadow-xs'
                      : 'border-neutral-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-600'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{cat}</span>
                </button>
              );
            })}

            {!isAddingCategory && (
              <button
                type="button"
                onClick={() => setIsAddingCategory(true)}
                className="min-h-[38px] px-3 py-1.5 text-xs font-semibold rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Custom</span>
              </button>
            )}
          </div>
        </div>

        {/* Note */}
        <div>
          <label
            htmlFor="note-field"
            className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1.5"
          >
            Note
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              <AlignLeft className="w-4 h-4" />
            </div>
            <input
              id="note-field"
              type="text"
              placeholder="Add note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={100}
              className="w-full min-h-[48px] bg-white dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 rounded-xl pl-10 pr-4 text-xs font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white transition-colors"
            />
          </div>
        </div>

        {error && (
          <p className="text-xs font-semibold text-red-500">{error}</p>
        )}

        {/* Mobile Sticky Primary Action: Save Transaction */}
        <div className="sticky bottom-0 left-0 right-0 pt-3 pb-safe bg-gradient-to-t from-white via-white/95 to-transparent dark:from-black dark:via-black/95">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 font-bold text-sm rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform cursor-pointer disabled:opacity-50 shadow-md"
          >
            <Check className="w-4 h-4" strokeWidth={2.5} />
            <span>{isSubmitting ? 'Saving...' : 'Save Transaction'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
