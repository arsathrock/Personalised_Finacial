import React from 'react';
import { Home, Calendar, Clock } from 'lucide-react';

export type MainTab = 'home' | 'calendar' | 'history';

interface BottomNavProps {
  currentTab: MainTab;
  onTabChange: (tab: MainTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const tabs = [
    { id: 'home' as MainTab, label: 'Home', icon: Home },
    { id: 'calendar' as MainTab, label: 'Calendar', icon: Calendar },
    { id: 'history' as MainTab, label: 'History', icon: Clock },
  ];

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-md border-t border-neutral-100 dark:border-neutral-900 transition-colors pb-safe"
    >
      <div className="max-w-2xl mx-auto grid grid-cols-3 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[48px] w-full transition-colors cursor-pointer ${
                isActive
                  ? 'text-neutral-950 dark:text-white font-bold'
                  : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 font-medium'
              }`}
            >
              <Icon
                className="w-5 h-5 transition-transform duration-150"
                strokeWidth={isActive ? 2.5 : 1.7}
              />
              <span className="text-[10px] font-semibold tracking-tight mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
