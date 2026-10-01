'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Calendar,
  Pin,
  Sparkles,
  Plus,
  Clock,
  ChevronRight,
  ShieldAlert,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  priority: string;
  isPinned: boolean;
  authorName: string;
  category: string;
  createdAt: string;
}

interface HolidayItem {
  id: string;
  date: string;
  name: string;
}

export function CompanyNoticeBoard() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // New announcement form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState('NORMAL');
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [annRes, holRes] = await Promise.all([
        fetch('/api/announcements'),
        fetch('/api/holidays'),
      ]);

      const annData = await annRes.json();
      const holData = await holRes.json();

      if (annData.success) {
        setAnnouncements(annData.data || []);
      }
      if (holData.success) {
        setHolidays(holData.data || []);
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          category,
          priority,
          isPinned,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Company notice published successfully!');
        setTitle('');
        setContent('');
        setCategory('General');
        setPriority('NORMAL');
        setIsPinned(false);
        setModalOpen(false);
        fetchData();
      } else {
        toast.error(data.error || 'Failed to publish notice');
      }
    } catch {
      toast.error('Network error publishing notice');
    } finally {
      setSubmitting(false);
    }
  };

  // Find next upcoming holiday
  const todayStr = new Date().toISOString().slice(0, 10);
  const upcomingHolidays = holidays
    .filter((h) => h.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date));
  const nextHoliday = upcomingHolidays[0];

  const getDaysUntil = (dateStr: string) => {
    const target = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today!';
    if (diff === 1) return 'Tomorrow';
    return `in ${diff} days`;
  };

  const formatHolidayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      day: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
    };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. Notice Board & Announcements (8 cols) */}
      <div className="lg:col-span-8 flex flex-col rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Bell className="size-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-foreground">Company Notice Board</h2>
              <p className="text-xs text-muted-foreground">Official corporate communications & town halls</p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setModalOpen(true)}
            className="h-8 gap-1.5 text-xs font-semibold"
          >
            <Plus className="size-3.5" />
            <span>Post Notice</span>
          </Button>
        </div>

        {/* Notices Feed */}
        {loading ? (
          <div className="py-12 text-center text-xs text-muted-foreground animate-pulse">
            Loading announcements...
          </div>
        ) : announcements.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No notices posted yet.
          </div>
        ) : (
          <div className="space-y-3.5 flex-1">
            {announcements.map((item) => (
              <div
                key={item.id}
                className={`relative rounded-xl border p-4 transition-all ${
                  item.isPinned
                    ? 'border-primary/40 bg-primary/5 shadow-xs'
                    : 'border-border/60 bg-secondary/20 hover:border-border'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.isPinned && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                        <Pin className="size-3" />
                        PINNED
                      </span>
                    )}
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      #{item.category}
                    </span>
                    {item.priority === 'HIGH' && (
                      <span className="rounded-md bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                        IMPORTANT
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                    {item.authorName}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-foreground mt-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Upcoming Holidays & Corporate Calendar (4 cols) */}
      <div className="lg:col-span-4 flex flex-col rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-amber-500/10 text-amber-600">
              <Calendar className="size-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-foreground">Holiday Calendar</h2>
              <p className="text-xs text-muted-foreground">Official paid corporate leaves</p>
            </div>
          </div>
        </div>

        {/* Highlight Next Holiday Card */}
        {nextHoliday && (
          <div className="rounded-xl bg-gradient-to-br from-[#1b1754] via-[#252175] to-[#3a34a8] text-white p-4 shadow-sm mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#F37021]">
              Upcoming Public Holiday
            </span>
            <h3 className="text-base font-bold tracking-tight mt-1">{nextHoliday.name}</h3>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-200">
              <span className="font-mono">{nextHoliday.date}</span>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 font-semibold text-[11px] backdrop-blur">
                {getDaysUntil(nextHoliday.date)}
              </span>
            </div>
          </div>
        )}

        {/* Holiday Chronological List */}
        <div className="space-y-2.5 flex-1">
          {holidays.slice(0, 5).map((h) => {
            const dateObj = formatHolidayDate(h.date);
            const isPast = h.date < todayStr;

            return (
              <div
                key={h.id}
                className={`flex items-center gap-3 p-2.5 rounded-xl border transition-colors ${
                  isPast
                    ? 'border-border/40 bg-secondary/10 opacity-50'
                    : 'border-border/60 bg-secondary/20 hover:border-primary/30'
                }`}
              >
                {/* Date Chip */}
                <div className="grid size-10 place-items-center rounded-lg bg-card border border-border font-bold text-center shrink-0">
                  <span className="text-[10px] uppercase text-muted-foreground leading-none">
                    {dateObj.month}
                  </span>
                  <span className="text-sm text-foreground leading-none">{dateObj.day}</span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-foreground">{h.name}</p>
                  <p className="text-[10px] text-muted-foreground">{dateObj.weekday} · Paid Leave</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Post Notice Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Post Company Announcement</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Broadcast critical company updates, policy adjustments, and town hall invites.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAnnouncement} className="space-y-3.5 pt-2">
            <div>
              <label className="text-xs font-bold text-foreground">Announcement Title *</label>
              <Input
                type="text"
                required
                placeholder="e.g. 📢 Q4 Quarterly Performance Review..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-foreground">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full h-10 rounded-xl border border-border bg-background px-3 text-xs"
                >
                  <option value="General">General</option>
                  <option value="Event">Event</option>
                  <option value="Policy">Policy</option>
                  <option value="HR">HR & Culture</option>
                  <option value="Engineering">Engineering</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="mt-1 w-full h-10 rounded-xl border border-border bg-background px-3 text-xs"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High / Important</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground">Announcement Body *</label>
              <textarea
                rows={3}
                required
                placeholder="Write message details..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pinNotice"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded border-border"
              />
              <label htmlFor="pinNotice" className="text-xs font-medium text-foreground cursor-pointer">
                Pin to top of company board
              </label>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submitting} className="font-semibold gap-1.5">
                <Send className="size-3.5" />
                {submitting ? 'Publishing...' : 'Publish Notice'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
