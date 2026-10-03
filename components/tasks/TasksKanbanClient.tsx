'use client';

import React, { useState, useMemo } from 'react';
import {
  ListTodo,
  Clock,
  CheckCircle2,
  CheckCircle,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Calendar,
  Flag,
  Tag,
  User,
  Trash2,
  Sparkles,
  Flame,
  CheckSquare,
  Circle,
  LayoutList,
  Kanban,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Users,
  ExternalLink,
  BarChart3,
  TrendingUp,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LinearTaskModal } from './LinearTaskModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export interface TaskItem {
  id: string;
  title: string;
  description?: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | string;
  dueDate?: string | null;
  category?: string | null;
  employeeId: string;
  createdAt: string;
  updatedAt: string;
  assignedTo: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    photoUrl?: string | null;
    department?: { name: string } | null;
    position?: { title: string } | null;
  };
}

export interface EmployeeOption {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  departmentName?: string;
  positionTitle?: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; badge: string; dot: string; icon: React.ElementType }
> = {
  TODO: {
    label: 'To Do',
    badge: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
    dot: 'bg-slate-400',
    icon: ListTodo,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    badge: 'bg-[#f37021]/10 text-[#f37021] dark:text-[#fb923c] border-[#f37021]/30 font-medium',
    dot: 'bg-[#f37021]',
    icon: Clock,
  },
  IN_REVIEW: {
    label: 'In Review',
    badge: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
    dot: 'bg-purple-400',
    icon: Clock,
  },
  DONE: {
    label: 'Completed',
    badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 font-medium',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
  },
};

const PRIORITY_CONFIG: Record<string, { label: string; badge: string; color: string }> = {
  URGENT: {
    label: 'Urgent',
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 font-bold',
    color: 'text-rose-500',
  },
  HIGH: {
    label: 'High',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-medium',
    color: 'text-amber-500',
  },
  MEDIUM: {
    label: 'Medium',
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    color: 'text-blue-500',
  },
  LOW: {
    label: 'Low',
    badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    color: 'text-slate-400',
  },
};

export function TasksKanbanClient({
  initialTasks,
  employees,
}: {
  initialTasks: TaskItem[];
  employees: EmployeeOption[];
}) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [viewMode, setViewMode] = useState<'list' | 'board' | 'team'>('list');
  const [statusTab, setStatusTab] = useState<string>('ALL');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [newStatus, setNewStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO');
  const [assigneeForNewTask, setAssigneeForNewTask] = useState<string | undefined>(undefined);

  // Team Workload View States
  const [teamSearch, setTeamSearch] = useState<string>('');
  const [teamDeptFilter, setTeamDeptFilter] = useState<string>('ALL');
  const [teamWorkloadFilter, setTeamWorkloadFilter] = useState<'ALL' | 'ACTIVE' | 'OVERDUE' | 'COMPLETED' | 'AVAILABLE'>('ALL');
  const [teamSortBy, setTeamSortBy] = useState<'assigned' | 'completion' | 'overdue' | 'name'>('assigned');
  const [expandedEmpId, setExpandedEmpId] = useState<string | null>(null);

  // Unique departments for filtering
  const uniqueDepartments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((emp) => {
      if (emp.departmentName) set.add(emp.departmentName);
    });
    return Array.from(set).sort();
  }, [employees]);

  // Per-Employee Workload Aggregations
  const employeeWorkloadStats = useMemo(() => {
    return employees.map((emp) => {
      const empTasks = tasks.filter((t) => t.employeeId === emp.id);
      const totalAssigned = empTasks.length;
      const completed = empTasks.filter((t) => t.status === 'DONE').length;
      const inProgress = empTasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'IN_REVIEW').length;
      const todo = empTasks.filter((t) => t.status === 'TODO').length;
      const overdue = empTasks.filter((t) => {
        if (t.status === 'DONE' || !t.dueDate) return false;
        return new Date(t.dueDate).getTime() < Date.now();
      }).length;
      const completionRate = totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0;

      let loadStatus: { label: string; badge: string; dot: string; type: string } = {
        label: 'Optimal',
        badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        dot: 'bg-emerald-500',
        type: 'OPTIMAL',
      };

      if (overdue > 0) {
        loadStatus = {
          label: `${overdue} Overdue`,
          badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
          dot: 'bg-rose-500 animate-pulse',
          type: 'OVERDUE',
        };
      } else if (totalAssigned >= 4) {
        loadStatus = {
          label: 'Heavy Load',
          badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          dot: 'bg-amber-500',
          type: 'HEAVY',
        };
      } else if (totalAssigned === 0) {
        loadStatus = {
          label: 'Available',
          badge: 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20',
          dot: 'bg-slate-400',
          type: 'AVAILABLE',
        };
      } else if (completed === totalAssigned && totalAssigned > 0) {
        loadStatus = {
          label: '100% Done',
          badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
          dot: 'bg-cyan-400',
          type: 'DONE',
        };
      }

      return {
        ...emp,
        tasks: empTasks,
        totalAssigned,
        completed,
        inProgress,
        todo,
        overdue,
        completionRate,
        loadStatus,
      };
    });
  }, [employees, tasks]);

  // Filtered & Sorted Employees for Team Workload View
  const filteredEmployeeStats = useMemo(() => {
    return employeeWorkloadStats
      .filter((emp) => {
        if (teamDeptFilter !== 'ALL' && emp.departmentName !== teamDeptFilter) return false;
        if (teamWorkloadFilter === 'ACTIVE' && emp.totalAssigned - emp.completed === 0) return false;
        if (teamWorkloadFilter === 'OVERDUE' && emp.overdue === 0) return false;
        if (teamWorkloadFilter === 'COMPLETED' && (emp.totalAssigned === 0 || emp.completed !== emp.totalAssigned)) return false;
        if (teamWorkloadFilter === 'AVAILABLE' && emp.totalAssigned > 0) return false;

        if (teamSearch.trim()) {
          const q = teamSearch.toLowerCase();
          const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
          const code = emp.employeeCode.toLowerCase();
          const dept = (emp.departmentName || '').toLowerCase();
          const title = (emp.positionTitle || '').toLowerCase();
          if (!fullName.includes(q) && !code.includes(q) && !dept.includes(q) && !title.includes(q)) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (teamSortBy === 'assigned') return b.totalAssigned - a.totalAssigned;
        if (teamSortBy === 'completion') return b.completionRate - a.completionRate;
        if (teamSortBy === 'overdue') return b.overdue - a.overdue;
        return a.firstName.localeCompare(b.firstName);
      });
  }, [employeeWorkloadStats, teamDeptFilter, teamWorkloadFilter, teamSearch, teamSortBy]);

  // Team Workload KPIs Summary
  const teamSummary = useMemo(() => {
    const totalStaff = employees.length;
    const staffWithTasks = employeeWorkloadStats.filter((e) => e.totalAssigned > 0).length;
    const totalAssignedTasks = tasks.length;
    const totalDoneTasks = tasks.filter((t) => t.status === 'DONE').length;
    const totalOverdueTasks = tasks.filter((t) => {
      if (t.status === 'DONE' || !t.dueDate) return false;
      return new Date(t.dueDate).getTime() < Date.now();
    }).length;
    const teamVelocity = totalAssignedTasks > 0 ? Math.round((totalDoneTasks / totalAssignedTasks) * 100) : 0;

    return { totalStaff, staffWithTasks, totalAssignedTasks, totalDoneTasks, totalOverdueTasks, teamVelocity };
  }, [employees, employeeWorkloadStats, tasks]);

  // Metrics
  const counts = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === 'TODO').length;
    const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'IN_REVIEW').length;
    const done = tasks.filter((t) => t.status === 'DONE').length;
    const overdue = tasks.filter((t) => {
      if (t.status === 'DONE' || !t.dueDate) return false;
      return new Date(t.dueDate).getTime() < Date.now();
    }).length;

    return { total, todo, inProgress, done, overdue };
  }, [tasks]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Status Tab filter
      if (statusTab === 'TODO' && t.status !== 'TODO') return false;
      if (statusTab === 'IN_PROGRESS' && t.status !== 'IN_PROGRESS' && t.status !== 'IN_REVIEW') return false;
      if (statusTab === 'DONE' && t.status !== 'DONE') return false;
      if (statusTab === 'OVERDUE') {
        if (t.status === 'DONE' || !t.dueDate) return false;
        if (new Date(t.dueDate).getTime() >= Date.now()) return false;
      }

      // Employee Filter
      if (selectedEmployeeId !== 'ALL' && t.employeeId !== selectedEmployeeId) {
        return false;
      }

      // Priority Filter
      if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) {
        return false;
      }

      // Search keyword filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description?.toLowerCase().includes(q);
        const matchCat = t.category?.toLowerCase().includes(q);
        const matchEmp = `${t.assignedTo.firstName} ${t.assignedTo.lastName}`.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCat && !matchEmp) return false;
      }

      return true;
    });
  }, [tasks, statusTab, selectedEmployeeId, priorityFilter, search]);

  // Quick Status Updater
  const handleUpdateStatus = async (taskId: string, newStatusValue: string) => {
    const original = tasks.find((t) => t.id === taskId);
    if (!original) return;

    // Optimistic UI
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatusValue } : t))
    );

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatusValue }),
      });
      const data = await res.json();
      if (!data.success) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: original.status } : t))
        );
        toast.error(data.error || 'Failed to update task status');
      } else {
        toast.success(
          newStatusValue === 'DONE'
            ? `Task marked as completed!`
            : `Status updated to ${STATUS_CONFIG[newStatusValue]?.label || newStatusValue}`
        );
      }
    } catch {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: original.status } : t))
      );
      toast.error('Network error updating task status');
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string, taskTitle: string) => {
    const original = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTask?.id === taskId) setSelectedTask(null);

    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success(`Task "${taskTitle}" deleted`);
      } else {
        if (original) setTasks((prev) => [...prev, original]);
        toast.error(data.error || 'Failed to delete task');
      }
    } catch {
      if (original) setTasks((prev) => [...prev, original]);
      toast.error('Network error deleting task');
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const renderDueDate = (dueDateStr?: string | null, isDone?: boolean) => {
    if (!dueDateStr) return <span className="text-muted-foreground/60 text-xs">—</span>;
    const due = new Date(dueDateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const diffDays = Math.round((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (isDone) {
      return (
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="size-3" />
          {due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      );
    }

    if (diffDays < 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
          <AlertTriangle className="size-3" />
          Overdue ({Math.abs(diffDays)}d)
        </span>
      );
    }
    if (diffDays === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
          <Clock className="size-3" />
          Today
        </span>
      );
    }
    return (
      <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
        <Calendar className="size-3" />
        {due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </span>
    );
  };

  return (
    <div className="space-y-5 pb-12">
      {/* ─── Page Title Header ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#252175] text-[#f37021] shadow-md shadow-[#252175]/20 ring-1 ring-white/10">
              <CheckSquare className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                Tasks & Workload
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage team assignments, deliverables, and track completion progress.
              </p>
            </div>
          </div>
        </div>

        {/* Action Header: View Toggle + Create Task */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* List vs Board vs Team Workload Toggle */}
          <div className="flex items-center rounded-xl border border-border/70 bg-card/60 p-1 backdrop-blur-md">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutList className="size-3.5" />
              <span>List View</span>
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'board'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Kanban className="size-3.5" />
              <span>Board View</span>
            </button>
            <button
              onClick={() => setViewMode('team')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'team'
                  ? 'bg-gradient-to-r from-indigo-500 to-[#252175] text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="size-3.5" />
              <span>Team Workload</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                  viewMode === 'team'
                    ? 'bg-white/20 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {employees.length}
              </span>
            </button>
          </div>

          <Button
            onClick={() => {
              setAssigneeForNewTask(undefined);
              setCreateModalOpen(true);
            }}
            className="bg-[#252175] hover:bg-[#1e1a5f] text-white shadow-md shadow-[#252175]/25 font-semibold text-xs h-9 px-3.5 rounded-xl gap-1.5 cursor-pointer"
          >
            <Plus className="size-4 text-[#f37021]" />
            <span>New Task</span>
          </Button>
        </div>
      </div>

      {/* ─── List & Board View Controls: Status Pill Tabs & Filter Bar ─────── */}
      {viewMode !== 'team' && (
        <>
          {/* Active Employee Filter Banner */}
          {selectedEmployeeId !== 'ALL' && (
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
              <div className="flex items-center gap-2">
                <User className="size-4 text-indigo-400 shrink-0" />
                <span className="text-slate-200">
                  Filtered by assignee:{' '}
                  <strong className="text-white">
                    {employees.find((e) => e.id === selectedEmployeeId)?.firstName}{' '}
                    {employees.find((e) => e.id === selectedEmployeeId)?.lastName}
                  </strong>{' '}
                  ({filteredTasks.length} tasks)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEmployeeId('ALL')}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                >
                  Show All Staff
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('team')}
                  className="text-xs font-bold text-slate-300 hover:text-white bg-white/10 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  View Workload Matrix →
                </button>
              </div>
            </div>
          )}

          {/* Simple Status Pill Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3">
            {[
              { key: 'ALL', label: 'All Tasks', count: counts.total },
              { key: 'TODO', label: 'To Do', count: counts.todo },
              { key: 'IN_PROGRESS', label: 'In Progress', count: counts.inProgress },
              { key: 'DONE', label: 'Completed', count: counts.done },
              ...(counts.overdue > 0
                ? [{ key: 'OVERDUE', label: 'Overdue', count: counts.overdue, isAlert: true }]
                : []),
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusTab(tab.key)}
                className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  statusTab === tab.key
                    ? tab.isAlert
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-card/70 border border-border/70 text-muted-foreground hover:text-foreground hover:bg-card'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                    statusTab === tab.key
                      ? 'bg-white/20 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search & Filters Bar */}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by task title, category, or employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl bg-card/60 border-border/70"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns: Employee & Priority */}
            <div className="flex items-center gap-2">
              {/* Employee filter */}
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="h-9 rounded-xl border border-border/70 bg-card dark:bg-[#131b2e] text-foreground dark:text-slate-100 px-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="ALL" className="bg-white dark:bg-[#0d121f] text-slate-900 dark:text-slate-100">All Team Members</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id} className="bg-white dark:bg-[#0d121f] text-slate-900 dark:text-slate-100">
                    {emp.firstName} {emp.lastName} ({emp.employeeCode})
                  </option>
                ))}
              </select>

              {/* Priority filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="h-9 rounded-xl border border-border/70 bg-card dark:bg-[#131b2e] text-foreground dark:text-slate-100 px-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="ALL" className="bg-white dark:bg-[#0d121f] text-slate-900 dark:text-slate-100">All Priorities</option>
                <option value="URGENT" className="bg-white dark:bg-[#0d121f] text-slate-900 dark:text-slate-100">🔴 Urgent</option>
                <option value="HIGH" className="bg-white dark:bg-[#0d121f] text-slate-900 dark:text-slate-100">🟡 High</option>
                <option value="MEDIUM" className="bg-white dark:bg-[#0d121f] text-slate-900 dark:text-slate-100">🔵 Medium</option>
                <option value="LOW" className="bg-white dark:bg-[#0d121f] text-slate-900 dark:text-slate-100">🟢 Low</option>
              </select>
            </div>
          </div>
        </>
      )}

      {/* ─── View 1: Spacious, User-Friendly LIST VIEW ───────────────────── */}
      {viewMode === 'list' && (
        <div className="rounded-2xl border border-border/70 bg-card/40 backdrop-blur-md shadow-xs overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <CheckSquare className="size-10 mx-auto opacity-30 mb-2" />
              <p className="font-semibold text-sm">No tasks found matching your filters</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Try selecting a different status tab or employee filter.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {filteredTasks.map((task) => {
                const isDone = task.status === 'DONE';
                const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
                const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.TODO;

                return (
                  <div
                    key={task.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 transition-colors hover:bg-card/70 ${
                      isDone ? 'opacity-70 bg-secondary/15' : ''
                    }`}
                  >
                    {/* Left: Complete toggle + Title + Category */}
                    <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                      <button
                        onClick={() =>
                          handleUpdateStatus(task.id, isDone ? 'IN_PROGRESS' : 'DONE')
                        }
                        className="mt-0.5 sm:mt-0 text-muted-foreground hover:text-emerald-500 transition-colors shrink-0"
                        title={isDone ? 'Reopen task' : 'Mark as Completed'}
                      >
                        {isDone ? (
                          <CheckCircle2 className="size-5 text-emerald-500" />
                        ) : (
                          <Circle className="size-5 hover:text-primary" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            onClick={() => setSelectedTask(task)}
                            className={`text-sm font-bold cursor-pointer transition-colors hover:text-primary ${
                              isDone ? 'line-through text-muted-foreground' : 'text-foreground'
                            }`}
                          >
                            {task.title}
                          </h3>
                          {task.category && (
                            <span className="rounded-md bg-secondary/80 px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                              #{task.category}
                            </span>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right Meta: Assignee + Priority + Due Date + Status Dropdown */}
                    <div className="flex items-center gap-3 sm:gap-4 pl-8 sm:pl-0 flex-wrap shrink-0">
                      {/* Assignee */}
                      <div className="flex items-center gap-2 min-w-[130px]">
                        <Avatar className="size-6 ring-1 ring-border">
                          {task.assignedTo.photoUrl && (
                            <AvatarImage
                              src={task.assignedTo.photoUrl}
                              alt={task.assignedTo.firstName}
                            />
                          )}
                          <AvatarFallback className="bg-[#252175] text-[#f37021] text-[10px] font-bold">
                            {getInitials(task.assignedTo.firstName, task.assignedTo.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {task.assignedTo.firstName} {task.assignedTo.lastName}
                          </p>
                        </div>
                      </div>

                      {/* Priority Badge */}
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] border shrink-0 ${priority.badge}`}
                      >
                        {priority.label}
                      </span>

                      {/* Due Date */}
                      <div className="min-w-[90px]">{renderDueDate(task.dueDate, isDone)}</div>

                      {/* Interactive Status Changer */}
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                        className="h-8 rounded-lg px-2.5 text-xs font-semibold border border-border/80 bg-card dark:bg-[#131b2e] text-slate-800 dark:text-slate-100 cursor-pointer focus:outline-none shadow-xs"
                      >
                        <option value="TODO" className="bg-white dark:bg-[#0d121f] text-slate-900 dark:text-slate-100 font-medium">To Do</option>
                        <option value="IN_PROGRESS" className="bg-white dark:bg-[#0d121f] text-[#f37021] dark:text-[#fb923c] font-medium">In Progress</option>
                        <option value="IN_REVIEW" className="bg-white dark:bg-[#0d121f] text-purple-600 dark:text-purple-300 font-medium">In Review</option>
                        <option value="DONE" className="bg-white dark:bg-[#0d121f] text-emerald-600 dark:text-emerald-400 font-medium">Completed</option>
                      </select>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteTask(task.id, task.title)}
                        className="text-muted-foreground/50 hover:text-rose-500 p-1 rounded-md transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── View 2: Clean, Spacious BOARD VIEW ───────────────────────────── */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {[
            { id: 'TODO', label: 'To Do', color: 'border-slate-500/30' },
            { id: 'IN_PROGRESS', label: 'In Progress', color: 'border-[#f37021]/40' },
            { id: 'DONE', label: 'Completed', color: 'border-emerald-500/40' },
          ].map((col) => {
            const colTasks = filteredTasks.filter((t) => {
              if (col.id === 'IN_PROGRESS') {
                return t.status === 'IN_PROGRESS' || t.status === 'IN_REVIEW';
              }
              return t.status === col.id;
            });

            return (
              <div
                key={col.id}
                className="flex flex-col rounded-2xl border border-border/70 bg-card/40 backdrop-blur-md p-4 min-h-[420px]"
              >
                {/* Column Header */}
                <div
                  className={`flex items-center justify-between pb-3 border-b ${col.color}`}
                >
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">
                      {col.label}
                    </h3>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-bold text-muted-foreground">
                      {colTasks.length}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setNewStatus(col.id as any);
                      setCreateModalOpen(true);
                    }}
                    className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    title={`Add task to ${col.label}`}
                  >
                    <Plus className="size-4" />
                  </button>
                </div>

                {/* Cards Container without ugly thick scrollbars */}
                <div className="mt-3.5 space-y-3 flex-1">
                  {colTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground/60 border border-dashed border-border/50 rounded-xl">
                      <p className="text-xs font-medium">No tasks in {col.label}</p>
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const isDone = task.status === 'DONE';
                      const priority =
                        PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;

                      return (
                        <div
                          key={task.id}
                          className={`rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs transition-all hover:border-primary/40 ${
                            isDone ? 'opacity-70 bg-card/50' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] border ${priority.badge}`}
                            >
                              {priority.label}
                            </span>
                            {task.category && (
                              <span className="text-[10px] font-mono text-muted-foreground">
                                #{task.category}
                              </span>
                            )}
                          </div>

                          <h4
                            onClick={() => setSelectedTask(task)}
                            className={`text-xs font-bold cursor-pointer hover:text-primary transition-colors leading-snug ${
                              isDone ? 'line-through text-muted-foreground' : 'text-foreground'
                            }`}
                          >
                            {task.title}
                          </h4>

                          {task.description && (
                            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          <div className="mt-2.5">{renderDueDate(task.dueDate, isDone)}</div>

                          {/* Footer */}
                          <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Avatar className="size-5 shrink-0 ring-1 ring-border">
                                {task.assignedTo.photoUrl && (
                                  <AvatarImage
                                    src={task.assignedTo.photoUrl}
                                    alt={task.assignedTo.firstName}
                                  />
                                )}
                                <AvatarFallback className="bg-[#252175] text-[#f37021] text-[9px] font-bold">
                                  {getInitials(
                                    task.assignedTo.firstName,
                                    task.assignedTo.lastName
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-[11px] font-medium text-foreground truncate">
                                {task.assignedTo.firstName} {task.assignedTo.lastName}
                              </span>
                            </div>

                            <select
                              value={task.status}
                              onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                              className="text-[10px] font-semibold bg-secondary dark:bg-[#131b2e] rounded px-2 py-0.5 border border-border text-foreground dark:text-slate-100 cursor-pointer focus:outline-none"
                            >
                              <option value="TODO" className="bg-white dark:bg-[#0d121f] text-slate-900 dark:text-slate-100 font-medium">To Do</option>
                              <option value="IN_PROGRESS" className="bg-white dark:bg-[#0d121f] text-[#f37021] dark:text-[#fb923c] font-medium">In Progress</option>
                              <option value="DONE" className="bg-white dark:bg-[#0d121f] text-emerald-600 dark:text-emerald-400 font-medium">Completed</option>
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── View 3: Comprehensive Superadmin TEAM WORKLOAD MATRIX ────────── */}
      {viewMode === 'team' && (
        <div className="space-y-6">
          {/* Top KPI Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-border/70 bg-card/50 backdrop-blur-md flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Active Workforce</p>
                <h3 className="text-2xl font-black text-foreground mt-0.5">{teamSummary.totalStaff}</h3>
                <p className="text-[11px] text-muted-foreground/80 mt-1">
                  {teamSummary.staffWithTasks} assigned deliverables
                </p>
              </div>
              <div className="size-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                <Users className="size-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-border/70 bg-card/50 backdrop-blur-md flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Team Completion Rate</p>
                <h3 className="text-2xl font-black text-emerald-500 mt-0.5">{teamSummary.teamVelocity}%</h3>
                <p className="text-[11px] text-muted-foreground/80 mt-1">
                  {teamSummary.totalDoneTasks} of {teamSummary.totalAssignedTasks} tasks completed
                </p>
              </div>
              <div className="size-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="size-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-border/70 bg-card/50 backdrop-blur-md flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">In-Flight Workload</p>
                <h3 className="text-2xl font-black text-[#f37021] mt-0.5">
                  {teamSummary.totalAssignedTasks - teamSummary.totalDoneTasks}
                </h3>
                <p className="text-[11px] text-muted-foreground/80 mt-1">
                  Active in-progress & to-do
                </p>
              </div>
              <div className="size-11 rounded-2xl bg-[#f37021]/10 border border-[#f37021]/20 flex items-center justify-center text-[#f37021]">
                <Clock className="size-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-border/70 bg-card/50 backdrop-blur-md flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Overdue / Blocked</p>
                <h3 className={`text-2xl font-black mt-0.5 ${teamSummary.totalOverdueTasks > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                  {teamSummary.totalOverdueTasks}
                </h3>
                <p className="text-[11px] text-muted-foreground/80 mt-1">
                  {teamSummary.totalOverdueTasks > 0 ? 'Tasks require intervention' : 'All deadlines on track'}
                </p>
              </div>
              <div className={`size-11 rounded-2xl border flex items-center justify-center ${teamSummary.totalOverdueTasks > 0 ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-slate-500/10 border-slate-500/20 text-slate-400'}`}>
                <AlertTriangle className="size-5" />
              </div>
            </div>
          </div>

          {/* Team Workload Controls Toolbar: Search, Dept Filter, Status Filter, Sort */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl border border-border/70 bg-card/40 backdrop-blur-md">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search staff by name, code (e.g. SX-001), or department..."
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl bg-background/50 border-border/80"
              />
              {teamSearch && (
                <button
                  type="button"
                  onClick={() => setTeamSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Filter controls */}
            <div className="flex items-center flex-wrap gap-2">
              {/* Department Filter */}
              <select
                value={teamDeptFilter}
                onChange={(e) => setTeamDeptFilter(e.target.value)}
                className="h-9 rounded-xl border border-border/70 bg-card dark:bg-[#131b2e] text-foreground dark:text-slate-100 px-3 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Departments</option>
                {uniqueDepartments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              {/* Workload Status Filter */}
              <select
                value={teamWorkloadFilter}
                onChange={(e) => setTeamWorkloadFilter(e.target.value as any)}
                className="h-9 rounded-xl border border-border/70 bg-card dark:bg-[#131b2e] text-foreground dark:text-slate-100 px-3 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Workloads</option>
                <option value="ACTIVE">With Active Tasks</option>
                <option value="OVERDUE">⚠️ Overdue Alerts</option>
                <option value="COMPLETED">✅ 100% Completed</option>
                <option value="AVAILABLE">🟢 Available (0 Tasks)</option>
              </select>

              {/* Sort By */}
              <select
                value={teamSortBy}
                onChange={(e) => setTeamSortBy(e.target.value as any)}
                className="h-9 rounded-xl border border-border/70 bg-card dark:bg-[#131b2e] text-foreground dark:text-slate-100 px-3 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="assigned">Sort: Most Tasks Assigned</option>
                <option value="completion">Sort: Highest Completion %</option>
                <option value="overdue">Sort: Most Overdue</option>
                <option value="name">Sort: Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Employee Workload Cards Grid */}
          {filteredEmployeeStats.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground rounded-2xl border border-border/70 bg-card/30">
              <Users className="size-10 mx-auto opacity-30 mb-2" />
              <p className="font-semibold text-sm">No team members match your filters</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Try clearing the search query or changing department filters.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTeamSearch('');
                  setTeamDeptFilter('ALL');
                  setTeamWorkloadFilter('ALL');
                }}
                className="mt-3 text-xs"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredEmployeeStats.map((emp) => {
                const isExpanded = expandedEmpId === emp.id;

                return (
                  <div
                    key={emp.id}
                    className="flex flex-col rounded-3xl border border-border/70 bg-card/60 backdrop-blur-md p-5 transition-all hover:border-primary/40 shadow-xs relative overflow-hidden"
                  >
                    {/* Top Identity Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="size-12 rounded-2xl ring-2 ring-primary/20 shrink-0">
                          {emp.photoUrl && (
                            <AvatarImage src={emp.photoUrl} alt={emp.firstName} />
                          )}
                          <AvatarFallback className="bg-gradient-to-br from-[#252175] to-indigo-600 text-white font-mono font-bold text-sm">
                            {getInitials(emp.firstName, emp.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-foreground truncate">
                            {emp.firstName} {emp.lastName}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {emp.positionTitle || 'Staff Member'}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-md bg-secondary text-muted-foreground font-semibold">
                              {emp.employeeCode}
                            </span>
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-primary/10 text-primary font-medium truncate max-w-[120px]">
                              {emp.departmentName || 'General'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Workload Status Badge */}
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0 ${emp.loadStatus.badge}`}>
                        <span className={`size-1.5 rounded-full ${emp.loadStatus.dot}`} />
                        {emp.loadStatus.label}
                      </span>
                    </div>

                    {/* Progress Bar & Rate */}
                    <div className="mt-4 pt-4 border-t border-border/60">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-muted-foreground">Completion Velocity</span>
                        <span className="font-mono font-bold text-foreground">
                          {emp.completed} / {emp.totalAssigned} done ({emp.completionRate}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary/80 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-500"
                          style={{ width: `${emp.completionRate}%` }}
                        />
                      </div>
                    </div>

                    {/* 4-Item Telemetry Matrix */}
                    <div className="grid grid-cols-4 gap-2 mt-4 p-3 rounded-2xl bg-secondary/30 border border-border/50 text-center">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Assigned</span>
                        <span className="text-base font-black text-foreground font-mono">{emp.totalAssigned}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider block">Done</span>
                        <span className="text-base font-black text-emerald-500 font-mono">{emp.completed}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider block">Pending</span>
                        <span className="text-base font-black text-amber-500 font-mono">{emp.inProgress + emp.todo}</span>
                      </div>
                      <div>
                        <span className={`text-[10px] uppercase font-bold tracking-wider block ${emp.overdue > 0 ? 'text-rose-500' : 'text-muted-foreground'}`}>Overdue</span>
                        <span className={`text-base font-black font-mono ${emp.overdue > 0 ? 'text-rose-500' : 'text-muted-foreground'}`}>{emp.overdue}</span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-border/60">
                      <div className="flex items-center gap-1.5">
                        {emp.totalAssigned > 0 && (
                          <button
                            type="button"
                            onClick={() => setExpandedEmpId(isExpanded ? null : emp.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-xs font-semibold text-foreground transition-all cursor-pointer"
                          >
                            <span>Tasks ({emp.totalAssigned})</span>
                            {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEmployeeId(emp.id);
                            setViewMode('list');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-primary/10 text-xs font-semibold text-primary transition-all cursor-pointer"
                          title="Open detailed list view filtered for this staff"
                        >
                          <span>Inspect in List</span>
                          <ExternalLink className="size-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setAssigneeForNewTask(emp.id);
                          setCreateModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#252175] hover:bg-[#1e1a5f] text-xs font-bold text-white transition-all cursor-pointer shadow-xs"
                      >
                        <Plus className="size-3.5 text-[#f37021]" />
                        <span>Assign</span>
                      </button>
                    </div>

                    {/* Expanded Task Roster within Card */}
                    {isExpanded && emp.tasks.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-border/60 space-y-2 animate-fadeIn">
                        <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider pb-1">
                          <span>Assigned Tasks</span>
                          <span>Status</span>
                        </div>
                        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                          {emp.tasks.map((task) => {
                            const isDone = task.status === 'DONE';
                            const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;

                            return (
                              <div
                                key={task.id}
                                className={`flex items-center justify-between p-2 rounded-xl border border-border/50 text-xs transition-colors hover:bg-secondary/40 ${
                                  isDone ? 'opacity-60 bg-secondary/20' : 'bg-background/40'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <button
                                    onClick={() => handleUpdateStatus(task.id, isDone ? 'IN_PROGRESS' : 'DONE')}
                                    className="shrink-0 text-muted-foreground hover:text-emerald-500 transition-colors"
                                  >
                                    {isDone ? (
                                      <CheckCircle2 className="size-4 text-emerald-500" />
                                    ) : (
                                      <Circle className="size-4 hover:text-primary" />
                                    )}
                                  </button>
                                  <span
                                    onClick={() => setSelectedTask(task)}
                                    className={`truncate cursor-pointer hover:underline font-medium ${
                                      isDone ? 'line-through text-muted-foreground' : 'text-foreground'
                                    }`}
                                  >
                                    {task.title}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold border ${priority.badge}`}>
                                    {priority.label}
                                  </span>
                                  <select
                                    value={task.status}
                                    onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                                    className="h-6 rounded-md px-1 text-[10px] font-bold border border-border bg-card text-foreground cursor-pointer focus:outline-none"
                                  >
                                    <option value="TODO">To Do</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="IN_REVIEW">In Review</option>
                                    <option value="DONE">Done</option>
                                  </select>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── Task Details Modal ───────────────────────────────────────────── */}
      {selectedTask && (
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="sm:max-w-lg bg-card border-border shadow-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2 text-primary mb-1">
                <CheckSquare className="size-4" />
                <span className="text-xs font-bold tracking-wider uppercase">
                  Task Specification
                </span>
              </div>
              <DialogTitle className="text-lg font-bold text-foreground">
                {selectedTask.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Assigned to {selectedTask.assignedTo.firstName}{' '}
                {selectedTask.assignedTo.lastName} ({selectedTask.assignedTo.employeeCode})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 pt-2 text-xs">
              {/* Assignee Card */}
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/30">
                <Avatar className="size-10 ring-2 ring-primary/20">
                  {selectedTask.assignedTo.photoUrl && (
                    <AvatarImage
                      src={selectedTask.assignedTo.photoUrl}
                      alt={selectedTask.assignedTo.firstName}
                    />
                  )}
                  <AvatarFallback className="bg-[#252175] text-[#f37021] text-xs font-bold">
                    {getInitials(
                      selectedTask.assignedTo.firstName,
                      selectedTask.assignedTo.lastName
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-sm">
                    {selectedTask.assignedTo.firstName} {selectedTask.assignedTo.lastName}
                  </p>
                  <p className="text-muted-foreground text-xs truncate">
                    {selectedTask.assignedTo.position?.title || 'Staff'} ·{' '}
                    {selectedTask.assignedTo.department?.name || 'Department'}
                  </p>
                </div>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary">
                  {selectedTask.assignedTo.employeeCode}
                </span>
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Status
                  </label>
                  <select
                    value={selectedTask.status}
                    onChange={(e) => {
                      const next = e.target.value;
                      handleUpdateStatus(selectedTask.id, next);
                      setSelectedTask({ ...selectedTask, status: next });
                    }}
                    className="mt-1 w-full h-9 rounded-xl border border-border bg-card dark:bg-[#131b2e] px-3 text-xs font-semibold text-foreground dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                  >
                    <option value="TODO" className="bg-white dark:bg-[#0d121f] text-slate-900 dark:text-slate-100">To Do</option>
                    <option value="IN_PROGRESS" className="bg-white dark:bg-[#0d121f] text-[#f37021] dark:text-[#fb923c]">In Progress</option>
                    <option value="IN_REVIEW" className="bg-white dark:bg-[#0d121f] text-purple-600 dark:text-purple-300">In Review</option>
                    <option value="DONE" className="bg-white dark:bg-[#0d121f] text-emerald-600 dark:text-emerald-400">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Priority
                  </label>
                  <div className="mt-1">
                    <span
                      className={`inline-block rounded-lg px-2.5 py-1.5 text-xs font-bold border ${
                        PRIORITY_CONFIG[selectedTask.priority]?.badge || ''
                      }`}
                    >
                      {selectedTask.priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Description / Instructions
                </label>
                <div className="mt-1 p-3 rounded-xl border border-border bg-background/50 text-foreground leading-relaxed min-h-[60px]">
                  {selectedTask.description || 'No detailed instructions provided.'}
                </div>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-2 text-muted-foreground pt-1">
                <div>
                  <span className="font-semibold">Category: </span>
                  #{selectedTask.category || 'General'}
                </div>
                <div>
                  <span className="font-semibold">Due Date: </span>
                  {selectedTask.dueDate
                    ? new Date(selectedTask.dueDate).toLocaleDateString()
                    : 'No deadline set'}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteTask(selectedTask.id, selectedTask.title)}
                className="gap-1.5 text-xs"
              >
                <Trash2 className="size-3.5" />
                Delete Task
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTask(null)}
                className="text-xs"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ─── Linear Task Modal ────────────────────────────────────────── */}
      <LinearTaskModal
        open={createModalOpen}
        onOpenChange={(open) => {
          setCreateModalOpen(open);
          if (!open) setAssigneeForNewTask(undefined);
        }}
        employees={employees}
        defaultEmployeeId={assigneeForNewTask || (selectedEmployeeId !== 'ALL' ? selectedEmployeeId : undefined)}
        defaultStatus={newStatus}
        onTaskCreated={(createdTask) => {
          setTasks((prev) => [createdTask, ...prev]);
        }}
      />
    </div>
  );
}
