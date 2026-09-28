import * as React from 'react';
import { cn } from '@/lib/utils/format';

export function Avatar({
  src,
  initials = 'EM',
  className,
  size = 'md',
}: {
  src?: string | null;
  initials?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const sizeClasses = {
    sm: 'size-8 text-xs',
    md: 'size-10 text-sm',
    lg: 'size-16 text-lg font-bold',
    xl: 'size-24 text-2xl font-bold',
  };

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-[#252175] via-[#3730a3] to-[#f37021] text-white font-semibold ring-2 ring-white dark:ring-slate-900 shadow-sm',
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt="avatar" className="size-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
