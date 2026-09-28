'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const AlertDialogContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>({ open: false, onOpenChange: () => {} });

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  return (
    <AlertDialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </AlertDialogContext.Provider>
  );
}

export function AlertDialogContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { open, onOpenChange } = React.useContext(AlertDialogContext);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          'relative z-50 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function AlertDialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-2 text-left', className)} {...props} />;
}

export function AlertDialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-lg font-bold text-foreground', className)} {...props} />;
}

export function AlertDialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

export function AlertDialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-2', className)}
      {...props}
    />
  );
}

export function AlertDialogCancel({
  children = 'Cancel',
  onClick,
  disabled,
}: {
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const { onOpenChange } = React.useContext(AlertDialogContext);
  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      onClick={() => {
        onClick?.();
        onOpenChange(false);
      }}
    >
      {children}
    </Button>
  );
}

export function AlertDialogAction({
  children,
  onClick,
  disabled,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Button
      type="button"
      disabled={disabled}
      className={cn('bg-[#252175] text-white hover:bg-[#1d1a5c]', className)}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
