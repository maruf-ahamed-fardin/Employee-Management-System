'use client';

import React, { useState, useMemo } from 'react';
import {
  ListTodo,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Calendar,
  Flag,
  Tag,
  User,
  MoreVertical,
  Trash2,
  Edit3,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Flame,
  CheckSquare,
  Circle,
  Eye,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

interface ColumnConfig {
  id: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  label: string;
  icon: React.ElementType;
  badgeClass: string;
  headerBorder: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: 'TODO',
    label: 'To Do',
    icon: ListTodo,
    badgeClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20',
    headerBorder: 'border-slate-500/40',
  },
  {
    id: 'IN_PROGRESS',
    label: 'In Progress',
    icon: Clock,
    badgeClass: 'bg-[#f37021]/15 text-[#ea580c] dark:text-[#fb923c] border-[#f37021]/30',
    headerBorder: 'border-[#f37021]/40',
  },
  {
    id: 'IN_REVIEW',
    label: 'In Review',
    icon: Eye,
    badgeClass: 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30',
    headerBorder: 'border-purple-500/40',
  },
  {
    id: 'DONE',
    label: 'Completed',
    icon: CheckCircle2,
    badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
    headerBorder: 'border-emerald-500/40',
  },
];

const PRIORITY_THEME: Record<string, { label: string; badge: string; border: string }> = {
  URGENT: {
    label: 'Urgent',
    badge: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 font-bold',
    border: 'hover:border-rose-500/50 hover:shadow-rose-500/10',
  },
  HIGH: {
    label: 'High',
    badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold',
    border: 'hover:border-amber-500/50 hover:shadow-amber-500/10',
  },
  MEDIUM: {
    label: 'Medium',
    badge: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
    border: 'hover:border-blue-500/50 hover:shadow-blue-500/10',
  },
  LOW: {
    label: 'Low',
    badge: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30',
    border: 'hover:border-slate-500/50 hover:shadow-slate-500/10',
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
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [todayFocus, setTodayFocus] = useState<boolean>(false);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [targetColumnForCreate, setTargetColumnForCreate] = useState<'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'>('TODO');
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  // Create Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newEmployeeId, setNewEmployeeId] = useState(employees[0]?.id || '');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [newCategory, setNewCategory] = useState('General');
  const [newDueDate, setNewDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Metrics computation
  const metrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'DONE').length;
    const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const inReview = tasks.filter((t) => t.status === 'IN_REVIEW').length;
    const todo = tasks.filter((t) => t.status === 'TODO').length;

    const now = new Date();
    const urgentOrOverdue = tasks.filter((t) => {
      if (t.status === 'DONE') return false;
      if (t.priority === 'URGENT') return true;
      if (t.dueDate) {
        return new Date(t.dueDate).getTime() < now.getTime();
      }
      return false;
    }).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, inReview, todo, urgentOrOverdue, completionRate };
  }, [tasks]);

  // Employee workload mapping (count active tasks per employee)
  const employeeTaskCounts = useMemo(() => {
    const map: Record<string, number> = {};
    tasks.forEach((t) => {
      if (t.status !== 'DONE') {
        map[t.employeeId] = (map[t.employeeId] || 0) + 1;
      }
    });
    return map;
  }, [tasks]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const tomorrowMidnight = todayMidnight + 24 * 60 * 60 * 1000;

    return tasks.filter((t) => {
      // Employee filter
      if (selectedEmployeeId !== 'ALL' && t.employeeId !== selectedEmployeeId) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) {
        return false;
      }

      // Today Focus filter
      if (todayFocus) {
        if (t.status === 'DONE') return false;
        const isUrgent = t.priority === 'URGENT';
        const isDueTodayOrPast = t.dueDate
          ? new Date(t.dueDate).getTime() < tomorrowMidnight
          : false;
        const isInProgress = t.status === 'IN_PROGRESS';
        if (!isUrgent && !isDueTodayOrPast && !isInProgress) return false;
      }

      // Search keyword filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = t.description?.toLowerCase().includes(q);
        const matchesCat = t.category?.toLowerCase().includes(q);
        const matchesAssignee = `${t.assignedTo.firstName} ${t.assignedTo.lastName}`
          .toLowerCase()
          .includes(q);
        const matchesCode = t.assignedTo.employeeCode.toLowerCase().includes(q);

        if (!matchesTitle && !matchesDesc && !matchesCat && !matchesAssignee && !matchesCode) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, selectedEmployeeId, priorityFilter, todayFocus, search]);

  // Optimistic status update handler
  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;

    // Optimistic state
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!data.success) {
        // Rollback
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: target.status } : t))
        );
        toast.error(data.error || 'Failed to update task status');
      } else {
        toast.success(
          newStatus === 'DONE'
            ? `Completed "${target.title}"!`
            : `Moved to ${newStatus.replace('_', ' ')}`
        );
      }
    } catch {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: target.status } : t))
      );
      toast.error('Network error updating task status');
    }
  };

  // Delete task handler
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

  // Create Task handler
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployeeId) {
      toast.error('Please select an employee');
      return;
    }
    if (!newTitle.trim()) {
      toast.error('Task title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: newEmployeeId,
          title: newTitle.trim(),
          description: newDescription.trim() || null,
          priority: newPriority,
          status: targetColumnForCreate,
          category: newCategory.trim() || 'General',
          dueDate: newDueDate || null,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setTasks((prev) => [data.data, ...prev]);
        toast.success('New task created and assigned!');
        setNewTitle('');
        setNewDescription('');
        setNewCategory('General');
        setNewDueDate('');
        setCreateModalOpen(false);
      } else {
        toast.error(data.error || 'Failed to create task');
      }
    } catch {
      toast.error('Network error creating task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const formatDueDateLabel = (dueDateStr?: string | null, isDone?: boolean) => {
    if (!dueDateStr) return null;
    const due = new Date(dueDateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());

    const diffDays = Math.round((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (isDone) {
      return (
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Calendar className="size-3" />
          {due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      );
    }

    if (diffDays < 0) {
      return (
        <span className="flex items-center gap-1 text-[11px] font-bold text-rose-500 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
          <AlertTriangle className="size-3" />
          Overdue ({Math.abs(diffDays)}d)
        </span>
      );
    }
    if (diffDays === 0) {
      return (
        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-500 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
          <Clock className="size-3" />
          Due Today
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <Calendar className="size-3" />
        {due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ─── Top Header & Controls ────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#252175] text-[#f37021] shadow-lg shadow-[#252175]/25 ring-1 ring-white/15">
              <CheckSquare className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  Workload & Tasks
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#f37021]/15 px-2.5 py-0.5 text-xs font-bold text-[#f37021] border border-[#f37021]/30">
                  <Sparkles className="size-3" />
                  Linear Kanban
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Centralized task tracking, daily team deliverables, and workload management.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => {
              setTargetColumnForCreate('TODO');
              setCreateModalOpen(true);
            }}
            className="bg-gradient-to-r from-[#252175] to-[#3a34a8] hover:from-[#1e1a5f] hover:to-[#2e2985] text-white shadow-lg shadow-[#252175]/30 font-semibold text-xs h-9 px-4 rounded-xl gap-1.5"
          >
            <Plus className="size-4 text-[#f37021]" />
            Assign New Task
          </Button>
        </div>
      </div>

      {/* ─── Metrics KPI Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        {/* Total Tasks */}
        <div className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl shadow-xs transition-all hover:border-[#252175]/40">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Active Tasks</span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <ListTodo className="size-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black tracking-tight text-foreground">
            {metrics.total - metrics.completed}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {metrics.total} total recorded tasks
          </p>
        </div>

        {/* In Progress */}
        <div className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl shadow-xs transition-all hover:border-[#f37021]/40">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">In Progress</span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-[#f37021]/15 text-[#f37021]">
              <Clock className="size-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black tracking-tight text-[#f37021]">
            {metrics.inProgress}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Actively being worked on
          </p>
        </div>

        {/* Completed */}
        <div className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl shadow-xs transition-all hover:border-emerald-500/40">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
            {metrics.completed}
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <div className="h-1.5 flex-1 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${metrics.completionRate}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground">
              {metrics.completionRate}%
            </span>
          </div>
        </div>

        {/* Urgent / Overdue Alert */}
        <div className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl shadow-xs transition-all hover:border-rose-500/40">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Urgent / Overdue</span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
              <Flame className="size-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black tracking-tight text-rose-600 dark:text-rose-400">
            {metrics.urgentOrOverdue}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Require immediate attention
          </p>
        </div>
      </div>

      {/* ─── Employee Avatar Filter Bar (People Strip) ───────────────────── */}
      <div className="rounded-2xl border border-border/60 bg-card/40 p-3 backdrop-blur-xl shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <User className="size-3.5 text-[#f37021]" />
            Filter by Team Member
          </span>
          {selectedEmployeeId !== 'ALL' && (
            <button
              onClick={() => setSelectedEmployeeId('ALL')}
              className="text-[11px] font-semibold text-primary hover:underline"
            >
              Reset to All
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {/* All Team Pill */}
          <button
            onClick={() => setSelectedEmployeeId('ALL')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all border ${
              selectedEmployeeId === 'ALL'
                ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                : 'bg-background/80 hover:bg-secondary border-border text-foreground'
            }`}
          >
            <span>All Members</span>
            <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
              {tasks.length}
            </span>
          </button>

          {/* Individual Employee Pills */}
          {employees.map((emp) => {
            const isSelected = selectedEmployeeId === emp.id;
            const activeCount = employeeTaskCounts[emp.id] || 0;
            return (
              <button
                key={emp.id}
                onClick={() => setSelectedEmployeeId(isSelected ? 'ALL' : emp.id)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all border ${
                  isSelected
                    ? 'bg-[#f37021]/15 text-[#ea580c] dark:text-[#fb923c] border-[#f37021]/50 ring-2 ring-[#f37021]/20 shadow-sm'
                    : 'bg-background/80 hover:bg-secondary/70 border-border text-foreground'
                }`}
              >
                <Avatar className="size-6 ring-1 ring-border">
                  {emp.photoUrl && <AvatarImage src={emp.photoUrl} alt={emp.firstName} />}
                  <AvatarFallback className="bg-[#252175] text-[#f37021] text-[10px] font-bold">
                    {getInitials(emp.firstName, emp.lastName)}
                  </AvatarFallback>
                </Avatar>
                <span>{emp.firstName}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                    activeCount > 0
                      ? 'bg-[#f37021]/20 text-[#f37021] font-bold'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {activeCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Search & Focus Filters ───────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tasks, categories (#Design, #Finance), or assignees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 rounded-xl bg-card/60 border-border/80 text-xs focus:ring-[#f37021]/30"
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

          {/* Today's Focus Button */}
          <Button
            variant={todayFocus ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTodayFocus(!todayFocus)}
            className={`h-10 rounded-xl text-xs gap-1.5 font-semibold transition-all ${
              todayFocus
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/25 border-orange-500'
                : 'border-border/80 hover:bg-secondary/60'
            }`}
          >
            <Flame className={`size-3.5 ${todayFocus ? 'text-white' : 'text-amber-500'}`} />
            <span>Today&apos;s Focus</span>
            {todayFocus && <span className="text-[10px] bg-white/20 rounded px-1">ON</span>}
          </Button>
        </div>

        {/* Priority Filter Dropdown */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="size-3.5" />
            <span>Priority:</span>
          </div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-10 rounded-xl border border-border/80 bg-card/60 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#f37021]/30"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">🔴 Urgent</option>
            <option value="HIGH">🟡 High</option>
            <option value="MEDIUM">🔵 Medium</option>
            <option value="LOW">🟢 Low</option>
          </select>
        </div>
      </div>

      {/* ─── Kanban Board 4 Columns ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 items-start">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          const ColIcon = col.icon;

          return (
            <div
              key={col.id}
              className="flex flex-col rounded-2xl border border-border/60 bg-card/30 backdrop-blur-md p-3.5 shadow-sm min-h-[480px]"
            >
              {/* Column Header */}
              <div
                className={`flex items-center justify-between pb-3 border-b ${col.headerBorder}`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`flex size-6 items-center justify-center rounded-lg border ${col.badgeClass}`}
                  >
                    <ColIcon className="size-3.5" />
                  </div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">
                    {col.label}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${col.badgeClass}`}
                  >
                    {colTasks.length}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setTargetColumnForCreate(col.id);
                    setCreateModalOpen(true);
                  }}
                  className="flex size-6 items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  title={`Add Task to ${col.label}`}
                >
                  <Plus className="size-3.5" />
                </button>
              </div>

              {/* Column Cards Container */}
              <div className="mt-3 space-y-3 flex-1 overflow-y-auto max-h-[700px] pr-0.5 scrollbar-thin">
                {colTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground/60 border border-dashed border-border/50 rounded-xl my-2">
                    <ColIcon className="size-7 opacity-30 mb-2" />
                    <p className="text-xs font-semibold">No tasks in {col.label}</p>
                    <button
                      onClick={() => {
                        setTargetColumnForCreate(col.id);
                        setCreateModalOpen(true);
                      }}
                      className="mt-2 text-[11px] font-semibold text-primary hover:underline"
                    >
                      + Create task
                    </button>
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const priorityInfo =
                      PRIORITY_THEME[task.priority] || PRIORITY_THEME.MEDIUM;
                    const isDone = task.status === 'DONE';

                    return (
                      <div
                        key={task.id}
                        className={`group relative rounded-xl border border-border/70 bg-card/90 p-3.5 shadow-2xs backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${priorityInfo.border} ${
                          isDone ? 'opacity-70 bg-card/40' : ''
                        }`}
                      >
                        {/* Priority & Category Header */}
                        <div className="flex items-center justify-between gap-1.5 mb-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] uppercase border ${priorityInfo.badge}`}
                            >
                              {priorityInfo.label}
                            </span>
                            {task.category && (
                              <span className="rounded bg-secondary/80 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                                #{task.category}
                              </span>
                            )}
                          </div>

                          {/* Quick Done Checkbox Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(
                                task.id,
                                isDone ? 'IN_PROGRESS' : 'DONE'
                              );
                            }}
                            className="text-muted-foreground hover:text-emerald-500 transition-colors"
                            title={isDone ? 'Reopen task' : 'Mark as Done'}
                          >
                            {isDone ? (
                              <CheckCircle2 className="size-4 text-emerald-500" />
                            ) : (
                              <Circle className="size-4 hover:text-primary" />
                            )}
                          </button>
                        </div>

                        {/* Task Title */}
                        <h4
                          onClick={() => setSelectedTask(task)}
                          className={`text-xs font-bold leading-snug cursor-pointer transition-colors hover:text-primary ${
                            isDone ? 'line-through text-muted-foreground' : 'text-foreground'
                          }`}
                        >
                          {task.title}
                        </h4>

                        {/* Task Description snippet */}
                        {task.description && (
                          <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* Due Date Indicator */}
                        {task.dueDate && (
                          <div className="mt-2.5">
                            {formatDueDateLabel(task.dueDate, isDone)}
                          </div>
                        )}

                        {/* Card Footer: Assignee & Move Action */}
                        <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between gap-2">
                          {/* Assignee info */}
                          <div className="flex items-center gap-2 min-w-0">
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

                          {/* Quick Column Transition Dropdown */}
                          <div className="flex items-center gap-1 shrink-0">
                            <select
                              value={task.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) =>
                                handleUpdateStatus(task.id, e.target.value)
                              }
                              className="text-[10px] font-semibold bg-secondary/80 hover:bg-secondary border border-border/80 rounded-md px-1.5 py-0.5 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                            >
                              <option value="TODO">To Do</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="IN_REVIEW">In Review</option>
                              <option value="DONE">Completed</option>
                            </select>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task.id, task.title);
                              }}
                              className="text-muted-foreground/60 hover:text-rose-500 p-0.5 rounded transition-colors"
                              title="Delete Task"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
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

      {/* ─── Task Details & Edit Modal ────────────────────────────────────── */}
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

            <div className="space-y-4 pt-2 text-xs">
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

              {/* Status and Priority Selectors */}
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
                    className="mt-1 w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="DONE">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Priority
                  </label>
                  <div className="mt-1">
                    <span
                      className={`inline-block rounded-lg px-2.5 py-1.5 text-xs font-bold border ${
                        PRIORITY_THEME[selectedTask.priority]?.badge || ''
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

              {/* Meta details */}
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

      {/* ─── Create / Assign Task Modal ───────────────────────────────────── */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-border shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-[#f37021] mb-1">
              <Plus className="size-4" />
              <span className="text-xs font-bold tracking-wider uppercase">
                Assign Work
              </span>
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              Create New Task
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Delegate responsibilities, set deadlines, and track deliverables.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTask} className="space-y-3.5 pt-2">
            {/* Assignee select */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Assigned Employee *
              </label>
              <select
                value={newEmployeeId}
                onChange={(e) => setNewEmployeeId(e.target.value)}
                required
                className="mt-1 w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeCode}) —{' '}
                    {emp.departmentName || 'Staff'}
                  </option>
                ))}
              </select>
            </div>

            {/* Task Title */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Task Title *
              </label>
              <Input
                type="text"
                required
                placeholder="e.g. Audit Q4 tax records, Finalize UI components..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>

            {/* Priority & Category Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Flag className="size-3.5 text-muted-foreground" />
                  Priority
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="mt-1 w-full h-9 rounded-xl border border-border bg-background px-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="LOW">🟢 Low</option>
                  <option value="MEDIUM">🔵 Medium</option>
                  <option value="HIGH">🟡 High</option>
                  <option value="URGENT">🔴 Urgent</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Tag className="size-3.5 text-muted-foreground" />
                  Category / Tag
                </label>
                <Input
                  type="text"
                  placeholder="Engineering, Design, HR..."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="mt-1 text-xs h-9"
                />
              </div>
            </div>

            {/* Due Date & Initial Column */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Calendar className="size-3.5 text-muted-foreground" />
                  Due Date
                </label>
                <Input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="mt-1 text-xs h-9"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Initial Column
                </label>
                <select
                  value={targetColumnForCreate}
                  onChange={(e) => setTargetColumnForCreate(e.target.value as any)}
                  className="mt-1 w-full h-9 rounded-xl border border-border bg-background px-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="DONE">Completed</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Detailed Instructions
              </label>
              <textarea
                rows={3}
                placeholder="Key deliverables, context, or acceptance criteria..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateModalOpen(false)}
                disabled={isSubmitting}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="bg-[#252175] hover:bg-[#1e1a5f] text-white font-semibold text-xs gap-1.5"
              >
                <CheckSquare className="size-3.5 text-[#f37021]" />
                {isSubmitting ? 'Assigning...' : 'Assign Task'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
