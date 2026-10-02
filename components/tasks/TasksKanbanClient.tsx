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
  Trash2,
  Sparkles,
  Flame,
  CheckSquare,
  Circle,
  LayoutList,
  Kanban,
  X,
  ChevronRight,
  MoreHorizontal,
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
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [statusTab, setStatusTab] = useState<string>('ALL');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [newStatus, setNewStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO');

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
        <div className="flex items-center gap-2.5">
          {/* List vs Board Toggle */}
          <div className="flex items-center rounded-xl border border-border/70 bg-card/60 p-1 backdrop-blur-md">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'board'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Kanban className="size-3.5" />
              <span>Board View</span>
            </button>
          </div>

          <Button
            onClick={() => setCreateModalOpen(true)}
            className="bg-[#252175] hover:bg-[#1e1a5f] text-white shadow-md shadow-[#252175]/25 font-semibold text-xs h-9 px-3.5 rounded-xl gap-1.5"
          >
            <Plus className="size-4 text-[#f37021]" />
            <span>New Task</span>
          </Button>
        </div>
      </div>

      {/* ─── Simple Status Pill Tabs ──────────────────────────────────────── */}
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

      {/* ─── Search & Filters Bar ─────────────────────────────────────────── */}
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
            className="h-9 rounded-xl border border-border/70 bg-card/80 px-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Team Members</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName} ({emp.employeeCode})
              </option>
            ))}
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-9 rounded-xl border border-border/70 bg-card/80 px-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">🔴 Urgent</option>
            <option value="HIGH">🟡 High</option>
            <option value="MEDIUM">🔵 Medium</option>
            <option value="LOW">🟢 Low</option>
          </select>
        </div>
      </div>

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
                        className={`h-8 rounded-lg px-2.5 text-xs font-semibold border cursor-pointer focus:outline-none ${status.badge}`}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="IN_REVIEW">In Review</option>
                        <option value="DONE">Completed</option>
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
                              className="text-[10px] font-semibold bg-secondary rounded px-1.5 py-0.5 border border-border text-foreground cursor-pointer focus:outline-none"
                            >
                              <option value="TODO">To Do</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="DONE">Completed</option>
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
                    className="mt-1 w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-ring"
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
        onOpenChange={setCreateModalOpen}
        employees={employees}
        defaultEmployeeId={selectedEmployeeId !== 'ALL' ? selectedEmployeeId : undefined}
        defaultStatus={newStatus}
        onTaskCreated={(createdTask) => {
          setTasks((prev) => [createdTask, ...prev]);
        }}
      />
    </div>
  );
}
