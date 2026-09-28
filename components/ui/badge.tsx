import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/format';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-[#252175]/10 text-[#252175] ring-1 ring-inset ring-[#252175]/20 dark:text-[#818cf8] dark:bg-[#4f46e5]/20 dark:ring-[#818cf8]/30',
        orange:
          'bg-[#f37021]/10 text-[#ea580c] ring-1 ring-inset ring-[#f37021]/25 dark:text-[#fb923c] dark:bg-[#f37021]/20 dark:ring-[#f37021]/30',
        brand:
          'bg-[#252175] text-white shadow-xs dark:bg-[#4f46e5]',
        secondary:
          'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
        success:
          'bg-emerald-500/10 text-emerald-700 ring-1 ring-inset ring-emerald-500/20 dark:text-emerald-300 dark:bg-emerald-500/20',
        warning:
          'bg-amber-500/10 text-amber-700 ring-1 ring-inset ring-amber-500/20 dark:text-amber-300 dark:bg-amber-500/20',
        destructive:
          'bg-rose-500/10 text-rose-700 ring-1 ring-inset ring-rose-500/20 dark:text-rose-300 dark:bg-rose-500/20',
        outline:
          'text-slate-700 ring-1 ring-inset ring-slate-300 dark:text-slate-300 dark:ring-slate-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
