'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/format';

interface DropdownContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DropdownContext = React.createContext<DropdownContextType | undefined>(undefined);

export function Dropdown({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownTrigger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(DropdownContext);
  if (!ctx) return null;

  return (
    <div
      onClick={() => ctx.setOpen((prev) => !prev)}
      className={cn('cursor-pointer inline-flex items-center', className)}
    >
      {children}
    </div>
  );
}

export function DropdownMenu({
  children,
  className,
  align = 'right',
}: {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right';
}) {
  const ctx = React.useContext(DropdownContext);
  if (!ctx?.open) return null;

  return (
    <div
      className={cn(
        'absolute z-50 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900',
        align === 'right' ? 'right-0' : 'left-0',
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownItem({
  children,
  onClick,
  className,
  destructive = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  destructive?: boolean;
}) {
  const ctx = React.useContext(DropdownContext);

  const handleClick = () => {
    if (onClick) onClick();
    ctx?.setOpen(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer',
        destructive && 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40',
        className
      )}
    >
      {children}
    </button>
  );
}
