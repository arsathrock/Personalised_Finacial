import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Settings, User, SlidersHorizontal, Pencil, Check, X } from 'lucide-react';

interface HeaderProps {
  ledgerName?: string;
  onUpdateLedgerName?: (newName: string) => void;
  sectionSubtitle?: 'HOME' | 'CALENDAR' | 'HISTORY';
  detailTitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  ledgerName = 'Ledger',
  onUpdateLedgerName,
  sectionSubtitle = 'HOME',
  detailTitle,
  showBack = false,
  onBack,
  onOpenSettings,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editVal, setEditVal] = useState(ledgerName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditVal(ledgerName);
  }, [ledgerName]);

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  const handleSave = () => {
    const trimmed = editVal.trim();
    if (trimmed && onUpdateLedgerName) {
      onUpdateLedgerName(trimmed);
    } else {
      setEditVal(ledgerName);
    }
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setEditVal(ledgerName);
      setIsEditingName(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-black border-b border-neutral-100 dark:border-neutral-900 transition-colors">
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity / Back button */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {showBack && (
            <button
              onClick={onBack}
              aria-label="Go back"
              className="min-h-[40px] min-w-[40px] -ml-1 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={2.2} />
            </button>
          )}

          {/* App Brand Icon badge */}
          <div className="w-8 h-8 rounded-lg bg-neutral-950 dark:bg-white flex items-center justify-center text-white dark:text-neutral-950 shrink-0 shadow-xs">
            <SlidersHorizontal className="w-4 h-4 rotate-90" strokeWidth={2.4} />
          </div>

          {/* Title / Section subtitle */}
          <div className="min-w-0 flex flex-col flex-1">
            {detailTitle ? (
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-neutral-900 dark:text-white truncate">
                {detailTitle}
              </h1>
            ) : isEditingName ? (
              <div className="flex items-center gap-1.5 py-0.5">
                <input
                  ref={inputRef}
                  type="text"
                  value={editVal}
                  onChange={(e) => setEditVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSave}
                  maxLength={24}
                  className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md px-2 py-0.5 text-xs sm:text-sm font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white max-w-[150px] sm:max-w-[200px]"
                />
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSave();
                  }}
                  aria-label="Confirm name"
                  className="w-6 h-6 flex items-center justify-center rounded-md bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setEditVal(ledgerName);
                    setIsEditingName(false);
                  }}
                  aria-label="Cancel editing"
                  className="w-6 h-6 flex items-center justify-center rounded-md text-neutral-400 hover:text-black dark:hover:text-white text-xs cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1.5 group">
                  <span
                    onClick={() => onUpdateLedgerName && setIsEditingName(true)}
                    className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white leading-tight truncate cursor-pointer hover:underline"
                    title="Click to rename"
                  >
                    {ledgerName}
                  </span>
                  {onUpdateLedgerName && (
                    <button
                      type="button"
                      onClick={() => setIsEditingName(true)}
                      aria-label="Rename ledger"
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-neutral-400 hover:text-black dark:hover:text-white transition-opacity p-0.5 cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 tracking-wider leading-none">
                  {sectionSubtitle}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Actions (Settings gear & User avatar) */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              aria-label="Settings and reports"
              className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" strokeWidth={2} />
            </button>
          )}

          <div
            onClick={onOpenSettings}
            role="button"
            aria-label="User profile and settings"
            className="w-8 h-8 rounded-full bg-neutral-950 dark:bg-neutral-800 flex items-center justify-center text-white dark:text-neutral-200 cursor-pointer shadow-xs hover:opacity-90 transition-opacity"
          >
            <User className="w-4 h-4" strokeWidth={2.2} />
          </div>
        </div>
      </div>
    </header>
  );
};
