import * as React from 'react';
import { cn } from '@/lib/utils/format';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  initials?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children?: React.ReactNode;
}

export function Avatar({
  src,
  initials,
  className,
  size = 'md',
  children,
  ...props
}: AvatarProps) {
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
      {...props}
    >
      {src ? (
        <img src={src} alt="avatar" className="size-full object-cover" />
      ) : children ? (
        children
      ) : (
        <span>{initials || 'SX'}</span>
      )}
    </div>
  );
}

export function AvatarImage({ src, alt = 'avatar' }: { src?: string | null; alt?: string }) {
  if (!src) return null;
  return <img src={src} alt={alt} className="size-full object-cover" />;
}

export function AvatarFallback({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'flex size-full items-center justify-center rounded-full bg-[#252175] text-[#F37021] font-bold',
        className
      )}
    >
      {children}
    </span>
  );
}
