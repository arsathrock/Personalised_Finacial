import { PeriodFilter } from '../types';

export function formatCurrency(amount: number, symbol: string = '$'): string {
  const parts = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${parts}`;
}

export function formatRelativeDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  
  const today = new Date();
  const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const diffTime = todayZero.getTime() - targetDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[month - 1]} ${year}`;
}

export function formatFullDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${months[month - 1]} ${day}, ${year}`;
}

export function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isInPeriod(dateStr: string, period: PeriodFilter, referenceDate: Date = new Date()): boolean {
  if (period === 'all') return true;
  if (!dateStr) return false;

  const [tYear, tMonth] = dateStr.split('-').map(Number);
  const curYear = referenceDate.getFullYear();
  const curMonth = referenceDate.getMonth() + 1;

  if (period === 'this_month') {
    return tYear === curYear && tMonth === curMonth;
  }

  if (period === 'last_month') {
    const lastMonth = curMonth === 1 ? 12 : curMonth - 1;
    const lastYear = curMonth === 1 ? curYear - 1 : curYear;
    return tYear === lastYear && tMonth === lastMonth;
  }

  if (period === 'this_year') {
    return tYear === curYear;
  }

  return true;
}

export function getMonthLabel(year: number, monthIndex: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${months[monthIndex]} ${year}`;
}
