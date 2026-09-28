'use client';

import React from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  link?: string | null;
  entityType?: string | null;
  createdAt: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / (1000 * 60));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationList({
  items,
  compact = false,
  onItemClick,
}: {
  items: NotificationItem[];
  compact?: boolean;
  onItemClick?: () => void;
}) {
  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground">
        <Bell className="size-8 mx-auto mb-2 text-muted-foreground/50" />
        <p className="font-semibold text-foreground">You&apos;re all caught up</p>
        <p className="text-[11px] mt-0.5">No notifications to display right now.</p>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'SUCCESS':
        return <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />;
      case 'WARNING':
      case 'ALERT':
        return <AlertTriangle className="size-4 text-[#F37021]" />;
      case 'INFO':
      default:
        return <Info className="size-4 text-primary" />;
    }
  };

  return (
    <ul className="divide-y divide-border/60">
      {items.map((item) => {
        const content = (
          <div
            className={`flex items-start gap-3 p-3.5 transition-colors ${
              !item.isRead ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-muted/40'
            } ${compact ? 'py-3 px-3.5' : 'sm:px-5 sm:py-4'}`}
          >
            <div className="size-8 rounded-xl bg-accent flex items-center justify-center shrink-0 mt-0.5">
              {getTypeIcon(item.type)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-foreground truncate">{item.title}</p>
                <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                  {timeAgo(item.createdAt)}
                </span>
              </div>

              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                {item.body}
              </p>

              {item.link && (
                <div className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-primary">
                  <span>View Details</span>
                  <ExternalLink className="size-3" />
                </div>
              )}
            </div>

            {!item.isRead && (
              <span
                className="size-2 rounded-full bg-[#F37021] shrink-0 mt-1.5 ring-2 ring-card"
                title="Unread notification"
              />
            )}
          </div>
        );

        return (
          <li key={item.id} onClick={onItemClick}>
            {item.link ? (
              <Link href={item.link} className="block group">
                {content}
              </Link>
            ) : (
              content
            )}
          </li>
        );
      })}
    </ul>
  );
}
