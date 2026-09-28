import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { NotificationList } from '@/components/notifications/NotificationList';
import { MarkAllReadButton } from '@/components/notifications/MarkAllReadButton';
import { Bell, CheckCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Notifications - SeloraX EMS',
  description: 'View updates, approval alerts, system notices, and requests that need your attention.',
};

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ unread?: string }>;
}) {
  const { unread } = await searchParams;
  const isUnreadOnly = unread === 'true';

  const where: any = {};
  if (isUnreadOnly) {
    where.isRead = false;
  }

  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      take: 40,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({
      where: { isRead: false },
    }),
  ]);

  const formattedItems = items.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    type: n.type,
    isRead: n.isRead,
    link: n.link,
    entityType: n.entityType,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Notifications Center
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} unread notices requiring your attention.`
              : 'You are all caught up.'}
          </p>
        </div>

        {unreadCount > 0 && <MarkAllReadButton />}
      </div>

      {/* Tabs */}
      <nav aria-label="Views" className="flex items-center gap-2">
        <Link
          href="/notifications"
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            !isUnreadOnly
              ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
              : 'bg-card text-muted-foreground border border-border hover:bg-secondary hover:text-foreground'
          }`}
        >
          All Notifications
        </Link>
        <Link
          href="/notifications?unread=true"
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            isUnreadOnly
              ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
              : 'bg-card text-muted-foreground border border-border hover:bg-secondary hover:text-foreground'
          }`}
        >
          <span>Unread Only</span>
          {unreadCount > 0 && (
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                isUnreadOnly ? 'bg-white/20 text-white' : 'bg-[#F37021] text-white'
              }`}
            >
              {unreadCount}
            </span>
          )}
        </Link>
      </nav>

      {/* List Container */}
      <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
        <NotificationList items={formattedItems} />
      </section>
    </div>
  );
}
