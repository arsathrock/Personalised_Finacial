import React from 'react';
import {
  Utensils,
  Coffee,
  Plane,
  Gift,
  Ticket,
  ShoppingBag,
  ShoppingCart,
  Briefcase,
  Video,
  Server,
  Dumbbell,
  Landmark,
  BookOpen,
  DollarSign,
  Receipt,
  MoreHorizontal,
  LucideIcon,
} from 'lucide-react';

interface CategoryIconProps {
  category: string;
  type?: 'income' | 'expense';
  className?: string;
  size?: number;
}

interface CategoryStyle {
  icon: LucideIcon;
  bgLight: string;
  textLight: string;
  bgDark: string;
  textDark: string;
}

export function getCategoryStyle(category: string, type: 'income' | 'expense' = 'expense'): CategoryStyle {
  const normalized = category.toLowerCase();

  if (normalized.includes('food') || normalized.includes('dining') || normalized.includes('grocery') || normalized.includes('market')) {
    if (normalized.includes('grocery') || normalized.includes('market')) {
      return {
        icon: ShoppingCart,
        bgLight: 'bg-sky-50',
        textLight: 'text-sky-600',
        bgDark: 'dark:bg-sky-950/60',
        textDark: 'dark:text-sky-400',
      };
    }
    return {
      icon: Utensils,
      bgLight: 'bg-amber-50',
      textLight: 'text-amber-600',
      bgDark: 'dark:bg-amber-950/60',
      textDark: 'dark:text-amber-400',
    };
  }

  if (normalized.includes('coffee') || normalized.includes('cafe') || normalized.includes('tea')) {
    return {
      icon: Coffee,
      bgLight: 'bg-orange-50',
      textLight: 'text-orange-600',
      bgDark: 'dark:bg-orange-950/60',
      textDark: 'dark:text-orange-400',
    };
  }

  if (normalized.includes('travel') || normalized.includes('transit') || normalized.includes('metro') || normalized.includes('flight') || normalized.includes('commute')) {
    return {
      icon: Plane,
      bgLight: 'bg-blue-50',
      textLight: 'text-blue-600',
      bgDark: 'dark:bg-blue-950/60',
      textDark: 'dark:text-blue-400',
    };
  }

  if (normalized.includes('gift')) {
    return {
      icon: Gift,
      bgLight: 'bg-pink-50',
      textLight: 'text-pink-600',
      bgDark: 'dark:bg-pink-950/60',
      textDark: 'dark:text-pink-400',
    };
  }

  if (normalized.includes('entertain') || normalized.includes('movie') || normalized.includes('game')) {
    return {
      icon: Ticket,
      bgLight: 'bg-purple-50',
      textLight: 'text-purple-600',
      bgDark: 'dark:bg-purple-950/60',
      textDark: 'dark:text-purple-400',
    };
  }

  if (normalized.includes('shop')) {
    return {
      icon: ShoppingBag,
      bgLight: 'bg-rose-50',
      textLight: 'text-rose-600',
      bgDark: 'dark:bg-rose-950/60',
      textDark: 'dark:text-rose-400',
    };
  }

  if (normalized.includes('gym') || normalized.includes('fitness') || normalized.includes('sport')) {
    return {
      icon: Dumbbell,
      bgLight: 'bg-indigo-50',
      textLight: 'text-indigo-600',
      bgDark: 'dark:bg-indigo-950/60',
      textDark: 'dark:text-indigo-400',
    };
  }

  if (normalized.includes('video') || normalized.includes('film') || normalized.includes('editing')) {
    return {
      icon: Video,
      bgLight: 'bg-teal-50',
      textLight: 'text-teal-600',
      bgDark: 'dark:bg-teal-950/60',
      textDark: 'dark:text-teal-400',
    };
  }

  if (normalized.includes('agency') || normalized.includes('business') || normalized.includes('consulting') || normalized.includes('retainer')) {
    return {
      icon: Briefcase,
      bgLight: 'bg-emerald-50',
      textLight: 'text-emerald-600',
      bgDark: 'dark:bg-emerald-950/60',
      textDark: 'dark:text-emerald-400',
    };
  }

  if (normalized.includes('book') || normalized.includes('sale')) {
    return {
      icon: BookOpen,
      bgLight: 'bg-violet-50',
      textLight: 'text-violet-600',
      bgDark: 'dark:bg-violet-950/60',
      textDark: 'dark:text-violet-400',
    };
  }

  if (normalized.includes('server') || normalized.includes('cloud') || normalized.includes('tech') || normalized.includes('software')) {
    return {
      icon: Server,
      bgLight: 'bg-slate-100',
      textLight: 'text-slate-700',
      bgDark: 'dark:bg-slate-800',
      textDark: 'dark:text-slate-300',
    };
  }

  if (type === 'income') {
    return {
      icon: Landmark,
      bgLight: 'bg-emerald-50',
      textLight: 'text-emerald-600',
      bgDark: 'dark:bg-emerald-950/60',
      textDark: 'dark:text-emerald-400',
    };
  }

  return {
    icon: Receipt,
    bgLight: 'bg-neutral-100',
    textLight: 'text-neutral-600',
    bgDark: 'dark:bg-neutral-800',
    textDark: 'dark:text-neutral-400',
  };
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  type = 'expense',
  className = 'w-10 h-10 rounded-xl',
  size = 18,
}) => {
  const style = getCategoryStyle(category, type);
  const Icon = style.icon;

  return (
    <div
      className={`flex items-center justify-center shrink-0 ${style.bgLight} ${style.textLight} ${style.bgDark} ${style.textDark} ${className}`}
    >
      <Icon size={size} strokeWidth={2} />
    </div>
  );
};
