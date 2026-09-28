'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/format';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900 dark:text-slate-100',
          className
        )}
        {...props}
      />
    );
  }
);

Label.displayName = 'Label';
