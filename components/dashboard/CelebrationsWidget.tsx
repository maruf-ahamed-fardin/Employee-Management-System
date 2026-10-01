'use client';

import React, { useState, useEffect } from 'react';
import {
  Cake,
  Award,
  Heart,
  Sparkles,
  Send,
  Plus,
  Flame,
  ThumbsUp,
  PartyPopper,
  Calendar,
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
import { toast } from 'sonner';

interface CelebrationItem {
  id: string;
  name: string;
  type: 'BIRTHDAY' | 'ANNIVERSARY';
  dateStr: string;
  detail: string;
  daysUntil: number;
}

const KUDOS_BADGES = [
  { label: 'Problem Solver', icon: '🧠', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  { label: 'Team Player', icon: '🤝', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { label: 'Code Wizard', icon: '⚡', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { label: 'Culture Champion', icon: '🌟', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { label: 'Customer Hero', icon: '🎯', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
];

export function CelebrationsWidget({ employees = [] }: { employees: any[] }) {
  const [activeTab, setActiveTab] = useState<'CELEBRATIONS' | 'KUDOS'>('CELEBRATIONS');
  const [kudosList, setKudosList] = useState<any[]>([]);
  const [kudosModalOpen, setKudosModalOpen] = useState(false);
  const [selectedReceiverId, setSelectedReceiverId] = useState(employees[0]?.id || '');
  const [selectedBadge, setSelectedBadge] = useState('Team Player');
  const [message, setMessage] = useState('');
  const [submittingKudos, setSubmittingKudos] = useState(false);

  // Compute upcoming birthdays and work anniversaries
  const celebrations: CelebrationItem[] = React.useMemo(() => {
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

  const fetchKudos = async () => {
    try {
      const res = await fetch('/api/kudos');
      const data = await res.json();
      if (res.ok && data.data) {
        setKudosList(data.data);
      }
    } catch {}
  };

  useEffect(() => {
    fetchKudos();
  }, []);

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
    if (!selectedReceiverId || !message.trim()) {
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
          message: message.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to send kudos');
      toast.success('Kudos published to the company wall! 🎉');
      setMessage('');
      setKudosModalOpen(false);
      fetchKudos();
    } catch (err: any) {
      toast.error(err.message || 'Error sending kudos');
    } finally {
      setSubmittingKudos(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden">
      {/* Header with Switcher Tabs */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('CELEBRATIONS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'CELEBRATIONS'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Cake className="size-3.5" />
            <span>Celebrations ({celebrations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('KUDOS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'KUDOS'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Sparkles className="size-3.5 text-amber-400" />
            <span>Peer Recognition</span>
          </button>
        </div>

        {activeTab === 'KUDOS' && (
          <Button
            size="sm"
            onClick={() => setKudosModalOpen(true)}
            className="h-7 text-xs bg-indigo-600 hover:bg-indigo-500 text-white gap-1 shadow-xs"
          >
            <Plus className="size-3.5" />
            Give Kudos
          </Button>
        )}
      </div>

      {/* Tab 1: Celebrations Content */}
      {activeTab === 'CELEBRATIONS' && (
        <div className="p-4 space-y-2.5 max-h-72 overflow-y-auto">
          {celebrations.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
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

      {/* Tab 2: Kudos Wall Content */}
      {activeTab === 'KUDOS' && (
        <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
          {kudosList.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No kudos posted yet. Be the first to applaud a colleague!
            </div>
          ) : (
            kudosList.map((k) => (
              <div
                key={k.id}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {k.receiverFirstName} {k.receiverLastName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {k.receiverCode}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
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

                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>From: {k.senderName}</span>
                  <span>{new Date(k.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Give Kudos Modal */}
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
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
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
                value={message}
                onChange={(e) => setMessage(e.target.value)}
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
