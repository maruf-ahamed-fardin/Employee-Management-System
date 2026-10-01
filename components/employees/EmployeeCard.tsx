'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  Clock,
  Plus,
  ArrowRight,
  User,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Circle,
  MapPin,
  Mail,
  Building2,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface TaskItem {
  id: string;
  title: string;
  description?: string | null;
  priority: string;
  status: string;
  dueDate?: string | Date | null;
  category?: string | null;
}

export interface EmployeeCardProps {
  employee: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    department?: { name: string };
    position?: { title: string };
    manager?: { firstName: string; lastName: string } | null;
    workLocation?: string;
    joiningDate?: string;
    headline?: string | null;
    businessPhone?: string | null;
    photoUrl?: string | null;
    tasks?: TaskItem[];
  };
  onAssignTask?: (employee: any) => void;
  onTaskStatusChange?: (taskId: string, newStatus: string) => void;
}

export function EmployeeCard({ employee, onAssignTask, onTaskStatusChange }: EmployeeCardProps) {
  const [localTasks, setLocalTasks] = useState<TaskItem[]>(employee.tasks || []);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  // Sync if prop changes
  React.useEffect(() => {
    setLocalTasks(employee.tasks || []);
  }, [employee.tasks]);

  const fullName = `${employee.firstName} ${employee.lastName}`;
  const initials = `${employee.firstName[0] || ''}${employee.lastName[0] || ''}`.toUpperCase();

  const activeTasks = localTasks.filter((t) => t.status !== 'DONE');
  const completedCount = localTasks.filter((t) => t.status === 'DONE').length;

  // Workload badge styling based on active task count
  const getWorkloadStatus = () => {
    const count = activeTasks.length;
    if (count === 0) {
      return {
        label: 'Available',
        className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
        dot: 'bg-emerald-500',
      };
    }
    if (count <= 2) {
      return {
        label: `${count} Active ${count === 1 ? 'Task' : 'Tasks'}`,
        className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
        dot: 'bg-blue-500',
      };
    }
    if (count <= 4) {
      return {
        label: `${count} Tasks (Moderate)`,
        className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
        dot: 'bg-amber-500',
      };
    }
    return {
      label: `${count} Tasks (High Load)`,
      className: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
      dot: 'bg-rose-500',
    };
  };

  const workload = getWorkloadStatus();
  const capacityPercent = Math.min(100, Math.round((activeTasks.length / 5) * 100));
  const capacityColor =
    capacityPercent === 0
      ? 'from-emerald-500 to-teal-400'
      : capacityPercent <= 40
      ? 'from-sky-500 to-indigo-500'
      : capacityPercent <= 80
      ? 'from-amber-500 to-orange-400'
      : 'from-rose-500 to-red-500';

  // Toggle task status
  const handleToggleTaskStatus = async (task: TaskItem) => {
    const nextStatus = task.status === 'DONE' ? 'IN_PROGRESS' : 'DONE';
    setUpdatingTaskId(task.id);

    // Optimistic UI update
    setLocalTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(
          nextStatus === 'DONE'
            ? `Marked "${task.title}" as completed`
            : `Reopened "${task.title}"`
        );
        if (onTaskStatusChange) {
          onTaskStatusChange(task.id, nextStatus);
        }
      } else {
        // Revert on error
        setLocalTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
        );
        toast.error('Failed to update task status');
      }
    } catch {
      setLocalTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      );
      toast.error('Network error updating task');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p.toUpperCase()) {
      case 'URGENT':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'MEDIUM':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  const formatDueDate = (d?: string | Date | null) => {
    if (!d) return null;
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/40">
      {/* Header Bar with Code & Workload Badge */}
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3.5">
        <span className="font-mono text-xs font-bold text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-md">
          {employee.employeeCode}
        </span>

        {/* Workload Status Pill */}
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${workload.className}`}
        >
          <span className={`size-1.5 rounded-full ${workload.dot}`} />
          {workload.label}
        </span>
      </div>

      {/* Employee Profile Identity */}
      <div className="mt-4 flex items-center gap-3.5">
        <div className="relative">
          <Avatar className="size-12 ring-2 ring-primary/20 bg-card">
            {employee.photoUrl && <AvatarImage src={employee.photoUrl} alt={fullName} />}
            <AvatarFallback className="bg-[#252175] text-[#F37021] font-bold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-500 ring-2 ring-card" title="Active on duty" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
            <Link href={`/employees/${employee.id}`} className="hover:underline">
              {fullName}
            </Link>
          </h3>
          <p className="truncate text-xs font-medium text-muted-foreground">
            {employee.position?.title || 'Staff Position'}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Building2 className="size-3 shrink-0" />
            <span className="truncate">{employee.department?.name || 'Department'}</span>
          </div>
        </div>
      </div>

      {/* Visual Workload Capacity Gauge */}
      <div className="mt-3.5 pt-2.5 border-t border-border/50">
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="text-muted-foreground font-medium">Workload Meter</span>
          <span className="font-mono font-bold text-foreground">{capacityPercent}% capacity</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-secondary/80 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${capacityColor} transition-all duration-500`}
            style={{ width: `${Math.max(5, capacityPercent)}%` }}
          />
        </div>
      </div>

      {/* Assigned Tasks Section */}
      <div className="mt-3.5 flex-1 rounded-xl border border-border/60 bg-secondary/20 p-3 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <CheckSquare className="size-3.5 text-primary" />
            <span>Assigned Tasks ({localTasks.length})</span>
          </div>
          {completedCount > 0 && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {completedCount} completed
            </span>
          )}
        </div>

        {/* Task List or Empty State */}
        {localTasks.length === 0 ? (
          <div className="my-auto py-5 text-center">
            <p className="text-xs text-muted-foreground">No tasks currently assigned</p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
              Ready for new assignments
            </p>
          </div>
        ) : (
          <div className="space-y-2 flex-1">
            {localTasks.slice(0, 3).map((task) => {
              const isDone = task.status === 'DONE';
              const isUpdating = updatingTaskId === task.id;

              return (
                <div
                  key={task.id}
                  className={`group/task flex items-start gap-2 rounded-lg border p-2 text-xs transition-all ${
                    isDone
                      ? 'border-border/40 bg-card/40 opacity-60'
                      : 'border-border bg-card shadow-2xs hover:border-primary/30'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleTaskStatus(task)}
                    disabled={isUpdating}
                    className="mt-0.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer shrink-0"
                    title={isDone ? 'Mark as In Progress' : 'Mark as Done'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                    ) : (
                      <Circle className="size-3.5" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate font-medium leading-tight ${
                        isDone ? 'line-through text-muted-foreground' : 'text-foreground'
                      }`}
                      title={task.title}
                    >
                      {task.title}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span
                        className={`rounded px-1.5 py-0.2 font-semibold uppercase border ${getPriorityBadge(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>

                      {task.category && (
                        <span className="text-muted-foreground font-mono">
                          #{task.category}
                        </span>
                      )}

                      {task.dueDate && (
                        <span className="inline-flex items-center gap-0.5 text-muted-foreground ml-auto">
                          <Calendar className="size-2.5" />
                          <span>{formatDueDate(task.dueDate)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {localTasks.length > 3 && (
              <p className="text-[11px] text-center font-medium text-muted-foreground pt-1">
                + {localTasks.length - 3} more assigned tasks
              </p>
            )}
          </div>
        )}
      </div>

      {/* Card Action Footer */}
      <div className="mt-4 pt-3 border-t border-border/60 flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => onAssignTask?.(employee)}
          className="flex-1 font-semibold text-xs h-9 gap-1.5 shadow-xs"
        >
          <Plus className="size-3.5" />
          <span>Assign Task</span>
        </Button>

        <Link href={`/employees/${employee.id}`} className="shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs h-9 px-3 font-medium border-border/80 hover:bg-accent"
          >
            <span>Profile</span>
            <ArrowRight className="size-3 ml-1" />
          </Button>
        </Link>
      </div>
    </article>
  );
}
