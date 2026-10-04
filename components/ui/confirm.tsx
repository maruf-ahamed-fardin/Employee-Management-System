'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { create } from 'zustand';
import { AlertTriangle, HelpCircle, LogOut, Trash2, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/format';

type ConfirmTone = 'primary' | 'warning' | 'danger';

export interface ConfirmOptions {
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  icon?: LucideIcon;
}

interface ConfirmState {
  options: ConfirmOptions | null;
  resolve: ((confirmed: boolean) => void) | null;
}

const useConfirmStore = create<ConfirmState>(() => ({ options: null, resolve: null }));

/**
 * Promise-based replacement for window.confirm(), rendered by <ConfirmHost />.
 *   if (!(await confirmDialog({ title: 'Delete document?', tone: 'danger' }))) return;
 */
export function confirmDialog(options: ConfirmOptions): Promise<boolean> {
  // A second request while one is open cancels the first rather than stacking
  useConfirmStore.getState().resolve?.(false);
  return new Promise<boolean>((resolve) => useConfirmStore.setState({ options, resolve }));
}

const TONES: Record<ConfirmTone, { icon: LucideIcon; halo: string; badge: string; button: string; glow: string }> = {
  primary: {
    icon: HelpCircle,
    halo: 'bg-primary/15',
    badge: 'bg-primary text-primary-foreground shadow-primary/40',
    button: 'bg-primary text-primary-foreground shadow-primary/30 hover:brightness-110 focus-visible:ring-ring',
    glow: 'bg-primary/25',
  },
  warning: {
    icon: LogOut,
    halo: 'bg-brand-orange/15',
    badge: 'bg-gradient-to-br from-amber-400 to-brand-orange-hover text-white shadow-brand-orange/40',
    button:
      'bg-gradient-to-r from-amber-500 to-brand-orange-hover text-white shadow-brand-orange/30 hover:brightness-110 focus-visible:ring-brand-orange',
    glow: 'bg-brand-orange/25',
  },
  danger: {
    icon: Trash2,
    halo: 'bg-destructive/15',
    badge: 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-red-500/40',
    button: 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-red-500/30 hover:brightness-110 focus-visible:ring-destructive',
    glow: 'bg-destructive/25',
  },
};

export function ConfirmHost() {
  const { options, resolve } = useConfirmStore();
  const [mounted, setMounted] = React.useState(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const confirmRef = React.useRef<HTMLButtonElement>(null);
  const titleId = React.useId();
  const descriptionId = React.useId();

  React.useEffect(() => setMounted(true), []);

  const close = React.useCallback(
    (confirmed: boolean) => {
      resolve?.(confirmed);
      useConfirmStore.setState({ options: null, resolve: null });
    },
    [resolve]
  );

  React.useEffect(() => {
    if (!options) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    // Destructive prompts start on Cancel so a stray Enter can't delete anything
    (options.tone === 'danger' ? cancelRef : confirmRef).current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close(false);
      } else if (e.key === 'Tab') {
        // Two buttons: keep focus cycling between them
        e.preventDefault();
        (document.activeElement === confirmRef.current ? cancelRef : confirmRef).current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [options, close]);

  if (!mounted || !options) return null;

  const tone = TONES[options.tone || 'primary'];
  const Icon = options.icon || (options.tone ? tone.icon : AlertTriangle);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
      <div className="animate-confirm-backdrop fixed inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => close(false)} />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={options.description ? descriptionId : undefined}
        className="animate-confirm-panel relative isolate w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-popover text-popover-foreground shadow-2xl shadow-black/40"
      >
        {/* Brand hairline and ambient glow */}
        <div aria-hidden className="absolute inset-x-0 top-0 h-px" style={{ background: 'var(--brand-gradient)' }} />
        <div aria-hidden className={cn('absolute -top-24 left-1/2 -z-10 size-56 -translate-x-1/2 rounded-full blur-3xl', tone.glow)} />

        <div className="flex flex-col items-center px-6 pb-6 pt-8 text-center">
          <div className={cn('flex size-20 items-center justify-center rounded-full', tone.halo)}>
            <div className={cn('flex size-14 items-center justify-center rounded-full shadow-lg', tone.badge)}>
              <Icon className="size-6" aria-hidden />
            </div>
          </div>

          <h2 id={titleId} className="mt-5 text-lg font-black tracking-tight text-foreground">
            {options.title}
          </h2>
          {options.description && (
            <p id={descriptionId} className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {options.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-border/60 bg-muted/30 p-4">
          <button
            ref={cancelRef}
            type="button"
            onClick={() => close(false)}
            className="h-11 cursor-pointer rounded-xl border bg-background text-sm font-semibold text-foreground transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
          >
            {options.cancelLabel || 'Cancel'}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={() => close(true)}
            className={cn(
              'h-11 cursor-pointer rounded-xl text-sm font-semibold shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-popover active:scale-[0.98]',
              tone.button
            )}
          >
            {options.confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
