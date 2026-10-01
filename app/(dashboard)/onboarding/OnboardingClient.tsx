'use client';

import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Search,
  Filter,
  RefreshCw,
  User,
  Building2,
  ShieldCheck,
  Trash2,
  Laptop,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AddTaskModal } from '@/components/onboarding/AddTaskModal';
import { toast } from 'sonner';
import Link from 'next/link';

interface OnboardingTask {
  id: string;
  employeeId: string;
  type: string;
  title: string;
  category: string;
  status: string;
  assignedTo: string;
  completedAt?: string | null;
  notes?: string | null;
}

interface OnboardingCase {
  employeeId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  photoUrl?: string | null;
  joiningDate?: string | null;
  departmentName?: string | null;
  positionTitle?: string | null;
  tasks: OnboardingTask[];
  totalTasks: number;
  completedTasks: number;
  completionPercent: number;
}

export function OnboardingClient({ employees = [] }: { employees: any[] }) {
  const [cases, setCases] = useState<OnboardingCase[]>([]);
  const [metrics, setMetrics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalCases: 0,
  });
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Add Task Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState<string | undefined>(undefined);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'ALL') params.set('type', typeFilter);

      const res = await fetch(`/api/onboarding?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.data) {
        setCases(data.data.cases || []);
        if (data.data.metrics) setMetrics(data.data.metrics);
      }
    } catch {
      toast.error('Failed to load onboarding cases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [typeFilter]);

  const handleToggleTask = async (task: OnboardingTask) => {
    const nextStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

    // Optimistic UI update
    setCases((prev) =>
      prev.map((c) => {
        if (c.employeeId !== task.employeeId) return c;
        const updatedTasks = c.tasks.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t));
        const completed = updatedTasks.filter((t) => t.status === 'COMPLETED').length;
        return {
          ...c,
          tasks: updatedTasks,
          completedTasks: completed,
          completionPercent: Math.round((completed / updatedTasks.length) * 100),
        };
      })
    );

    try {
      const res = await fetch(`/api/onboarding/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error('Failed to update task');
      toast.success(nextStatus === 'COMPLETED' ? 'Milestone achieved! ✓' : 'Task marked as pending');
    } catch (err: any) {
      toast.error(err.message || 'Error updating task');
      fetchCases(); // revert
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/onboarding/${taskId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete task');
      toast.success('Task removed from checklist');
      fetchCases();
    } catch (err: any) {
      toast.error(err.message || 'Error deleting task');
    }
  };

  const filteredCases = cases.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(q) ||
      c.employeeCode.toLowerCase().includes(q) ||
      (c.departmentName && c.departmentName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Employee Lifecycle & Clearances
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
            Onboarding & Offboarding Pipelines
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
            Automate new hire IT provisioning, compliance verification, and offboarding handover checklists.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCases}
            className="border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => {
              setSelectedEmpId(undefined);
              setModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium gap-1.5 shadow-md shadow-indigo-600/25 text-xs"
          >
            <Plus className="size-4" />
            Add Lifecycle Task
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Cases</span>
            <div className="size-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <User className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {metrics.totalCases}
            </span>
            <span className="text-xs text-slate-400">employees tracked</span>
          </div>
          <div className="mt-1 text-xs text-indigo-500 font-medium">New hire & exit workflows</div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Completed Tasks
            </span>
            <div className="size-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-300 font-mono">
              {metrics.completedTasks}
            </span>
            <span className="text-xs text-emerald-500/80">of {metrics.totalTasks} milestones</span>
          </div>
          <div className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
            {metrics.totalTasks > 0 ? Math.round((metrics.completedTasks / metrics.totalTasks) * 100) : 0}% compliance achieved
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Pending Actions
            </span>
            <div className="size-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-300 font-mono">
              {metrics.pendingTasks}
            </span>
            <span className="text-xs text-amber-500/80">awaiting completion</span>
          </div>
          <div className="mt-1 text-xs text-amber-600 dark:text-amber-400">IT, NDA, & verification</div>
        </div>

        <div className="p-4 rounded-2xl bg-sky-500/5 border border-sky-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              Hardware Alignment
            </span>
            <div className="size-8 rounded-xl bg-sky-500/15 text-sky-500 flex items-center justify-center">
              <Laptop className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-sky-600 dark:text-sky-300 font-mono">
              Active
            </span>
            <span className="text-xs text-sky-500/80">linked to /assets</span>
          </div>
          <div className="mt-1 text-xs text-sky-600 dark:text-sky-400">Direct inventory dispatch</div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          {[
            { id: 'ALL', label: 'All Lifecycle Cases' },
            { id: 'ONBOARDING', label: '🐣 New Hire Onboarding' },
            { id: 'OFFBOARDING', label: '🚪 Exit Clearance' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                typeFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search employee or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
          />
        </div>
      </div>

      {/* Lifecycle Cases Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
          <RefreshCw className="size-6 animate-spin text-indigo-400" />
          <p className="text-xs">Loading employee lifecycle checklists...</p>
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="p-12 text-center text-slate-400 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
          <ClipboardCheck className="size-10 mx-auto text-slate-400 mb-2" />
          <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">No lifecycle cases found</p>
          <p className="text-xs text-slate-400 mt-1">Add tasks for employees joining or leaving the company.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredCases.map((c) => (
            <div
              key={c.employeeId}
              className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm space-y-4 hover:border-indigo-500/30 transition-all flex flex-col justify-between"
            >
              {/* Employee Top Profile & Progress */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="size-12 ring-2 ring-indigo-500/20">
                    {c.photoUrl && <AvatarImage src={c.photoUrl} alt={c.fullName} />}
                    <AvatarFallback className="bg-indigo-600 text-white font-bold text-xs">
                      {c.firstName[0]}
                      {c.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{c.fullName}</span>
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded">
                        {c.employeeCode}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {c.positionTitle || 'Associate'} • {c.departmentName || 'General'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block font-mono text-xs font-extrabold px-2 py-0.5 rounded-full ${
                      c.completionPercent === 100
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}
                  >
                    {c.completionPercent}% Ready
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {c.completedTasks} of {c.totalTasks} done
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    c.completionPercent === 100
                      ? 'bg-emerald-500'
                      : 'bg-gradient-to-r from-indigo-500 to-sky-400'
                  }`}
                  style={{ width: `${Math.max(5, c.completionPercent)}%` }}
                />
              </div>

              {/* Checklist Items */}
              <div className="space-y-2 flex-1">
                {c.tasks.map((task) => {
                  const isDone = task.status === 'COMPLETED';
                  return (
                    <div
                      key={task.id}
                      className={`flex items-start justify-between gap-2.5 p-2.5 rounded-xl border text-xs transition-all ${
                        isDone
                          ? 'border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/40 opacity-75'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleToggleTask(task)}
                          className="mt-0.5 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer shrink-0"
                        >
                          {isDone ? (
                            <CheckCircle2 className="size-4 text-emerald-500" />
                          ) : (
                            <Circle className="size-4 text-slate-400" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <p
                            className={`font-medium ${
                              isDone
                                ? 'line-through text-slate-400'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                            <span className="px-1.5 py-0.2 rounded font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                              {task.category}
                            </span>
                            <span>•</span>
                            <span>{task.assignedTo}</span>
                            {task.notes && (
                              <>
                                <span>•</span>
                                <span className="italic truncate max-w-[120px]">{task.notes}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors shrink-0"
                        title="Delete task"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Card Actions */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedEmpId(c.employeeId);
                    setModalOpen(true);
                  }}
                  className="h-7 text-xs text-indigo-500 hover:text-indigo-400 gap-1 px-2"
                >
                  <Plus className="size-3" />
                  Add Milestone
                </Button>

                <Link
                  href={`/employees/${c.employeeId}`}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-medium"
                >
                  <span>Employee Record</span>
                  <ExternalLink className="size-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Task Modal */}
      <AddTaskModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        employees={employees}
        defaultEmployeeId={selectedEmpId}
        onSuccess={fetchCases}
      />
    </div>
  );
}
