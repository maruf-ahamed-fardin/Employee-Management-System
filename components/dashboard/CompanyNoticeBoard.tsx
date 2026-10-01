'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Cake,
  PartyPopper,
  Heart,
  User,
  ShieldCheck,
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

interface CelebrationItem {
  id: string;
  name: string;
  type: 'BIRTHDAY' | 'ANNIVERSARY';
  dateStr: string;
  detail: string;
  daysUntil: number;
}

const KUDOS_BADGES = [
  { label: 'Problem Solver', icon: '🧠' },
  { label: 'Team Player', icon: '🤝' },
  { label: 'Code Wizard', icon: '⚡' },
  { label: 'Culture Champion', icon: '🌟' },
  { label: 'Customer Hero', icon: '🎯' },
];

export function CompanyNoticeBoard({ employees = [] }: { employees?: any[] }) {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Right Rail Tab state: HOLIDAYS, CELEBRATIONS, KUDOS
  const [pulseTab, setPulseTab] = useState<'HOLIDAYS' | 'CELEBRATIONS' | 'KUDOS'>('HOLIDAYS');
  const [kudosList, setKudosList] = useState<any[]>([]);
  const [kudosModalOpen, setKudosModalOpen] = useState(false);
  const [selectedReceiverId, setSelectedReceiverId] = useState(employees[0]?.id || '');
  const [selectedBadge, setSelectedBadge] = useState('Team Player');
  const [kudosMessage, setKudosMessage] = useState('');
  const [submittingKudos, setSubmittingKudos] = useState(false);

  // New announcement form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState('NORMAL');
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [annRes, holRes, kudosRes] = await Promise.all([
        fetch('/api/announcements'),
        fetch('/api/holidays').catch(() => null),
        fetch('/api/kudos').catch(() => null),
      ]);

      if (annRes.ok) {
        const annData = await annRes.json();
        setAnnouncements(annData.data || []);
      }

      if (holRes && holRes.ok) {
        const holData = await holRes.json();
        setHolidays(holData.data || []);
      } else {
        // High quality fallback public holidays if endpoint not seeded
        setHolidays([
          { id: 'h1', date: '2026-12-16', name: 'Victory Day' },
          { id: 'h2', date: '2027-01-01', name: "New Year's Day" },
          { id: 'h3', date: '2027-02-21', name: 'International Mother Language Day' },
          { id: 'h4', date: '2027-03-26', name: 'Independence Day' },
          { id: 'h5', date: '2027-04-14', name: 'Bengali New Year (Pohela Boishakh)' },
          { id: 'h6', date: '2027-05-01', name: 'May Day' },
        ]);
      }

      if (kudosRes && kudosRes.ok) {
        const kData = await kudosRes.json();
        setKudosList(kData.data || []);
      }
    } catch (err) {
      console.error('Failed to load notice board data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute upcoming birthdays and work anniversaries
  const celebrations: CelebrationItem[] = useMemo(() => {
    const list: CelebrationItem[] = [];
    const today = new Date();
    const currentYear = today.getFullYear();

    employees.forEach((emp) => {
      const fullName = `${emp.firstName} ${emp.lastName}`;

      // 1. Birthday
      if (emp.dateOfBirth) {
        try {
          const dob = new Date(emp.dateOfBirth);
          let bdayThisYear = new Date(currentYear, dob.getMonth(), dob.getDate());
          if (bdayThisYear < today) {
            bdayThisYear = new Date(currentYear + 1, dob.getMonth(), dob.getDate());
          }
          const diffTime = bdayThisYear.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays <= 45) {
            list.push({
              id: `bday-${emp.id}`,
              name: fullName,
              type: 'BIRTHDAY',
              dateStr: bdayThisYear.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              detail: diffDays === 0 ? 'Today! 🎉' : `in ${diffDays} days`,
              daysUntil: diffDays,
            });
          }
        } catch {}
      }

      // 2. Work Anniversary
      if (emp.joiningDate) {
        try {
          const join = new Date(emp.joiningDate);
          const years = currentYear - join.getFullYear();
          if (years > 0) {
            let annivThisYear = new Date(currentYear, join.getMonth(), join.getDate());
            if (annivThisYear < today) {
              annivThisYear = new Date(currentYear + 1, join.getMonth(), join.getDate());
            }
            const diffTime = annivThisYear.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 45) {
              list.push({
                id: `anniv-${emp.id}`,
                name: fullName,
                type: 'ANNIVERSARY',
                dateStr: annivThisYear.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                detail: `${years} Year${years > 1 ? 's' : ''} at SeloraX`,
                daysUntil: diffDays,
              });
            }
          }
        } catch {}
      }
    });

    return list.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [employees]);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Title and message body are required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category,
          priority,
          isPinned,
          authorName: 'HR & Leadership',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to post');

      toast.success('Announcement published to company board');
      setTitle('');
      setContent('');
      setIsPinned(false);
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Error publishing notice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeKudos = async (id: string) => {
    setKudosList((prev) =>
      prev.map((k) => (k.id === id ? { ...k, likesCount: k.likesCount + 1 } : k))
    );
    try {
      await fetch('/api/kudos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      toast.success('Applauded!');
    } catch {}
  };

  const handleSendKudos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceiverId || !kudosMessage.trim()) {
      toast.error('Please pick a teammate and enter an appreciation note');
      return;
    }

    setSubmittingKudos(true);
    try {
      const res = await fetch('/api/kudos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedReceiverId,
          badge: selectedBadge,
          message: kudosMessage.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to send kudos');
      toast.success('Kudos published to the company wall! 🎉');
      setKudosMessage('');
      setKudosModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Error sending kudos');
    } finally {
      setSubmittingKudos(false);
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* 1. Notice Board & Announcements (8 cols on desktop, 100% on mobile) */}
      <div className="col-span-12 lg:col-span-8 flex flex-col rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20">
              <Bell className="size-4.5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Company Notice Board</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Official corporate communications & town halls</p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setModalOpen(true)}
            className="h-8 gap-1.5 text-xs font-semibold border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Plus className="size-3.5" />
            <span>Post Notice</span>
          </Button>
        </div>

        {/* Notices Feed */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
            Loading announcements...
          </div>
        ) : announcements.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No notices posted yet.
          </div>
        ) : (
          <div className="space-y-3 flex-1">
            {announcements.map((item) => (
              <div
                key={item.id}
                className={`relative rounded-xl border p-4 transition-all ${
                  item.isPinned
                    ? 'border-indigo-500/30 bg-indigo-500/5 dark:bg-indigo-950/20 shadow-2xs'
                    : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.isPinned && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/15 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-500 dark:text-indigo-400">
                        <Pin className="size-3" />
                        PINNED
                      </span>
                    )}
                    <span className="rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                      #{item.category}
                    </span>
                    {item.priority === 'HIGH' && (
                      <span className="rounded-md bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                        IMPORTANT
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap">
                    {item.authorName}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2 leading-snug">{item.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Company Pulse Hub: Holidays, Birthdays, Kudos (4 cols on desktop, 100% on mobile) */}
      <div className="col-span-12 lg:col-span-4 flex flex-col rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 sm:p-6 shadow-sm">
        {/* Sleek Tab Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 mb-4">
          <button
            onClick={() => setPulseTab('HOLIDAYS')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center whitespace-nowrap cursor-pointer ${
              pulseTab === 'HOLIDAYS'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            📅 Holidays
          </button>
          <button
            onClick={() => setPulseTab('CELEBRATIONS')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center whitespace-nowrap cursor-pointer ${
              pulseTab === 'CELEBRATIONS'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            🎂 Birthdays ({celebrations.length})
          </button>
          <button
            onClick={() => setPulseTab('KUDOS')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center whitespace-nowrap cursor-pointer ${
              pulseTab === 'KUDOS'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            ⭐ Kudos
          </button>
        </div>

        {/* Tab 1: Holidays Content */}
        {pulseTab === 'HOLIDAYS' && (
          <div className="space-y-3.5 flex-1">
            {/* Highlight Next Holiday Card */}
            {nextHoliday && (
              <div className="rounded-xl bg-gradient-to-br from-[#1b1754] via-[#252175] to-[#3a34a8] text-white p-4 shadow-sm">
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
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {holidays.slice(0, 5).map((h) => {
                const dateObj = formatHolidayDate(h.date);
                const isPast = h.date < todayStr;

                return (
                  <div
                    key={h.id}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition-colors ${
                      isPast
                        ? 'border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-950/20 opacity-50'
                        : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40 hover:border-indigo-500/30'
                    }`}
                  >
                    {/* Date Chip */}
                    <div className="grid size-10 place-items-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-center shrink-0">
                      <span className="text-[10px] uppercase text-slate-400 leading-none">
                        {dateObj.month}
                      </span>
                      <span className="text-sm text-slate-900 dark:text-white leading-none mt-0.5">{dateObj.day}</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{h.name}</p>
                      <p className="text-[10px] text-slate-400">{dateObj.weekday} · Paid Corporate Leave</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Celebrations Content */}
        {pulseTab === 'CELEBRATIONS' && (
          <div className="space-y-2.5 max-h-80 overflow-y-auto flex-1">
            {celebrations.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                No birthdays or work milestones in the next 45 days.
              </div>
            ) : (
              celebrations.map((item) => {
                const isBday = item.type === 'BIRTHDAY';
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40 hover:border-indigo-500/30 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isBday
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}
                      >
                        {isBday ? <Cake className="size-4" /> : <PartyPopper className="size-4" />}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {item.daysUntil === 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-rose-500 text-white animate-pulse">
                              TODAY
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <span>{isBday ? 'Birthday' : 'Work Milestone'}</span>
                          <span>•</span>
                          <span className="font-medium text-indigo-500 dark:text-indigo-400">
                            {item.dateStr} ({item.detail})
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => toast.success(`Wishes sent to ${item.name}! 🎉🎈`)}
                      className="h-7 px-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors cursor-pointer"
                    >
                      Wish 🎉
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 3: Kudos Content */}
        {pulseTab === 'KUDOS' && (
          <div className="space-y-3 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500">Recent Appreciations</span>
              <Button
                size="sm"
                onClick={() => setKudosModalOpen(true)}
                className="h-7 text-xs bg-indigo-600 hover:bg-indigo-500 text-white gap-1 px-2.5 shadow-xs"
              >
                <Plus className="size-3.5" />
                Give Kudos
              </Button>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto flex-1">
              {kudosList.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No kudos posted yet. Be the first to applaud a colleague!
                </div>
              ) : (
                kudosList.map((k) => (
                  <div
                    key={k.id}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {k.receiverFirstName} {k.receiverLastName}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {k.badge}
                        </span>
                      </div>

                      <button
                        onClick={() => handleLikeKudos(k.id)}
                        className="flex items-center gap-1 text-[11px] text-rose-500 hover:text-rose-400 font-bold transition-transform active:scale-125 cursor-pointer"
                      >
                        <Heart className="size-3.5 fill-rose-500" />
                        <span>{k.likesCount}</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                      "{k.message}"
                    </p>

                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                      <span>From: {k.senderName}</span>
                      <span>{new Date(k.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
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

      {/* Give Kudos Dialog */}
      <Dialog open={kudosModalOpen} onOpenChange={setKudosModalOpen}>
        <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Sparkles className="size-4.5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white">Give Peer Kudos</DialogTitle>
                <DialogDescription className="text-slate-400 text-xs">
                  Recognize and appreciate a teammate's hard work.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSendKudos} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select Colleague
              </label>
              <select
                value={selectedReceiverId}
                onChange={(e) => setSelectedReceiverId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kudos Badge
              </label>
              <div className="grid grid-cols-2 gap-2">
                {KUDOS_BADGES.map((b) => (
                  <button
                    key={b.label}
                    type="button"
                    onClick={() => setSelectedBadge(b.label)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all text-left ${
                      selectedBadge === b.label
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{b.icon}</span>
                    <span className="truncate">{b.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Appreciation Message
              </label>
              <textarea
                rows={3}
                required
                value={kudosMessage}
                onChange={(e) => setKudosMessage(e.target.value)}
                placeholder="e.g. Thanks for helping troubleshoot the production deployment yesterday!"
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setKudosModalOpen(false)}
                className="border-slate-700 text-slate-300 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submittingKudos}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5 shadow-md shadow-indigo-600/25"
              >
                <Send className="size-3.5" />
                <span>{submittingKudos ? 'Publishing...' : 'Publish Kudos'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
