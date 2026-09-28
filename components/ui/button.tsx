import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/format';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm hover:opacity-90 focus-visible:ring-ring',
        orange:
          'bg-[#f37021] text-white shadow-sm shadow-orange-500/20 hover:bg-[#dc5e10] focus-visible:ring-[#f37021]',
        brand:
          'bg-[#252175] text-white shadow-sm shadow-indigo-950/25 hover:bg-[#1c185c] dark:bg-[#4f46e5] dark:hover:bg-[#4338ca] focus-visible:ring-ring',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 focus-visible:ring-destructive',
        outline:
          'border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-800 dark:hover:text-slate-50',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost:
          'hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100',
        link: 'text-primary underline-offset-4 hover:underline dark:text-primary',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-xl px-6 text-base',
        icon: 'size-10 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
