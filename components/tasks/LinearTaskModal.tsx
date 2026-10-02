'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  X,
  Sparkles,
  Calendar,
  Tag,
  User,
  Plus,
  Circle,
  Clock,
  CheckCircle2,
  AlertCircle,
  CornerDownLeft,
  ChevronDown,
  Search,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

export interface EmployeeSelectOption {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  departmentName?: string;
  positionTitle?: string;
}

interface LinearTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: EmployeeSelectOption[];
  defaultEmployeeId?: string;
  defaultStatus?: 'TODO' | 'IN_PROGRESS' | 'DONE';
  onTaskCreated?: (task: any) => void;
}

const STATUS_OPTIONS = [
  { id: 'TODO', label: 'To Do', color: 'text-slate-400', icon: Circle, bg: 'bg-slate-500/10' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'text-[#f37021]', icon: Clock, bg: 'bg-[#f37021]/15' },
  { id: 'DONE', label: 'Completed', color: 'text-emerald-500', icon: CheckCircle2, bg: 'bg-emerald-500/15' },
];

const PRIORITY_OPTIONS = [
  { id: 'URGENT', label: 'Urgent', color: 'text-rose-500', barCount: 3, bg: 'bg-rose-500/10' },
  { id: 'HIGH', label: 'High', color: 'text-amber-500', barCount: 3, bg: 'bg-amber-500/10' },
  { id: 'MEDIUM', label: 'Medium', color: 'text-blue-500', barCount: 2, bg: 'bg-blue-500/10' },
  { id: 'LOW', label: 'Low', color: 'text-slate-400', barCount: 1, bg: 'bg-slate-500/10' },
];

const QUICK_CATEGORIES = ['Engineering', 'Design', 'Product', 'HR & Ops', 'Finance', 'Policy'];

export function LinearTaskModal({
  open,
  onOpenChange,
  employees,
  defaultEmployeeId,
  defaultStatus = 'TODO',
  onTaskCreated,
}: LinearTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [employeeId, setEmployeeId] = useState(defaultEmployeeId || employees[0]?.id || '');
  const [status, setStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>(defaultStatus);
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [category, setCategory] = useState('General');
  const [dueDate, setDueDate] = useState('');
  const [createMore, setCreateMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active popup state for Linear pills
  const [activeDropdown, setActiveDropdown] = useState<'assignee' | 'status' | 'priority' | 'date' | 'category' | null>(null);
  const [assigneeSearch, setAssigneeSearch] = useState('');

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (defaultEmployeeId) setEmployeeId(defaultEmployeeId);
      if (defaultStatus) setStatus(defaultStatus);
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    } else {
      setActiveDropdown(null);
    }
  }, [open, defaultEmployeeId, defaultStatus]);

  const selectedEmployee = employees.find((e) => e.id === employeeId) || employees[0];
  const selectedStatus = STATUS_OPTIONS.find((s) => s.id === status) || STATUS_OPTIONS[0];
  const selectedPriority = PRIORITY_OPTIONS.find((p) => p.id === priority) || PRIORITY_OPTIONS[2];

  const filteredEmployees = employees.filter((e) => {
    if (!assigneeSearch.trim()) return true;
    const q = assigneeSearch.toLowerCase();
    return (
      e.firstName.toLowerCase().includes(q) ||
      e.lastName.toLowerCase().includes(q) ||
      e.employeeCode.toLowerCase().includes(q) ||
      e.departmentName?.toLowerCase().includes(q)
    );
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('General');
    setDueDate('');
    setPriority('MEDIUM');
    setActiveDropdown(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      toast.error('Task title is required');
      titleInputRef.current?.focus();
      return;
    }
    if (!employeeId) {
      toast.error('Please assign to a team member');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          title: title.trim(),
          description: description.trim() || null,
          priority,
          status,
          category: category.trim() || 'General',
          dueDate: dueDate || null,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        toast.success(`Task assigned to ${selectedEmployee?.firstName || 'employee'}`);
        if (onTaskCreated) onTaskCreated(data.data);

        if (createMore) {
          resetForm();
          setTimeout(() => titleInputRef.current?.focus(), 50);
        } else {
          resetForm();
          onOpenChange(false);
        }
      } else {
        toast.error(data.error || 'Failed to create task');
      }
    } catch {
      toast.error('Network error creating task');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Global keydown: Ctrl + Enter to submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideCloseButton
        className="sm:max-w-2xl p-0 overflow-visible bg-[#0d121f] text-slate-100 border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl rounded-2xl"
      >
        <div onKeyDown={handleKeyDown} className="focus:outline-none">
        {/* Linear Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/8 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="flex size-5 items-center justify-center rounded-md bg-[#252175]/80 text-[#f37021] text-[10px] font-black ring-1 ring-white/15">
              SX
            </span>
            <span className="text-slate-400 font-medium">SeloraX</span>
            <span className="text-white/20">/</span>
            <span className="text-slate-200 font-semibold flex items-center gap-1.5">
              <Sparkles className="size-3 text-[#f37021]" />
              New Task
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-[11px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
              ⌘ + ↵ to create
            </span>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Linear Title & Description Inputs (Borderless & Clean) */}
        <div className="px-6 pt-5 pb-3 space-y-3">
          {/* Borderless Title */}
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title..."
            className="w-full bg-transparent text-lg font-bold text-white placeholder:text-slate-500 focus:outline-none tracking-tight border-none p-0"
          />

          {/* Borderless Description */}
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add description, deliverables, or acceptance criteria..."
            className="w-full bg-transparent text-xs text-slate-300 placeholder:text-slate-500 focus:outline-none resize-none leading-relaxed border-none p-0 scrollbar-none"
          />
        </div>

        {/* Linear Floating Action Pills (Assignee, Status, Priority, Due Date, Tag) */}
        <div className="px-6 py-3 border-t border-white/8 relative">
          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Status Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setActiveDropdown(activeDropdown === 'status' ? null : 'status')
                }
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  activeDropdown === 'status'
                    ? 'border-primary bg-primary/20 text-white'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                <selectedStatus.icon className={`size-3.5 ${selectedStatus.color}`} />
                <span>{selectedStatus.label}</span>
                <ChevronDown className="size-3 text-slate-400 opacity-60" />
              </button>

              {activeDropdown === 'status' && (
                <div className="absolute left-0 top-full mt-1.5 w-44 rounded-xl border border-white/15 bg-[#141b2d] shadow-2xl backdrop-blur-2xl z-50 p-1 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </div>
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setStatus(opt.id as any);
                        setActiveDropdown(null);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-white/10 text-slate-200 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <opt.icon className={`size-3.5 ${opt.color}`} />
                        <span>{opt.label}</span>
                      </div>
                      {status === opt.id && <Check className="size-3.5 text-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Priority Pill (Linear Style Bars) */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setActiveDropdown(activeDropdown === 'priority' ? null : 'priority')
                }
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  activeDropdown === 'priority'
                    ? 'border-primary bg-primary/20 text-white'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                {/* Linear Signal Bars icon */}
                <span className="flex items-end gap-0.5 h-3">
                  <span
                    className={`w-0.5 rounded-full ${
                      selectedPriority.barCount >= 1 ? selectedPriority.color : 'bg-white/20'
                    }`}
                    style={{ height: '35%' }}
                  />
                  <span
                    className={`w-0.5 rounded-full ${
                      selectedPriority.barCount >= 2 ? selectedPriority.color : 'bg-white/20'
                    }`}
                    style={{ height: '70%' }}
                  />
                  <span
                    className={`w-0.5 rounded-full ${
                      selectedPriority.barCount >= 3 ? selectedPriority.color : 'bg-white/20'
                    }`}
                    style={{ height: '100%' }}
                  />
                </span>
                <span>{selectedPriority.label}</span>
                <ChevronDown className="size-3 text-slate-400 opacity-60" />
              </button>

              {activeDropdown === 'priority' && (
                <div className="absolute left-0 top-full mt-1.5 w-44 rounded-xl border border-white/15 bg-[#141b2d] shadow-2xl backdrop-blur-2xl z-50 p-1 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Priority
                  </div>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setPriority(opt.id as any);
                        setActiveDropdown(null);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-white/10 text-slate-200 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`size-2 rounded-full ${opt.color.replace('text-', 'bg-')}`} />
                        <span>{opt.label}</span>
                      </div>
                      {priority === opt.id && <Check className="size-3.5 text-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Assignee Pill (Avatar + Name) */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setActiveDropdown(activeDropdown === 'assignee' ? null : 'assignee')
                }
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  activeDropdown === 'assignee'
                    ? 'border-primary bg-primary/20 text-white'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                {selectedEmployee ? (
                  <>
                    <Avatar className="size-4.5 ring-1 ring-white/20">
                      {selectedEmployee.photoUrl && (
                        <AvatarImage src={selectedEmployee.photoUrl} alt={selectedEmployee.firstName} />
                      )}
                      <AvatarFallback className="bg-[#252175] text-[#f37021] text-[9px] font-bold">
                        {getInitials(selectedEmployee.firstName, selectedEmployee.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <span>
                      {selectedEmployee.firstName} {selectedEmployee.lastName}
                    </span>
                  </>
                ) : (
                  <>
                    <User className="size-3.5 text-slate-400" />
                    <span>Assignee</span>
                  </>
                )}
                <ChevronDown className="size-3 text-slate-400 opacity-60" />
              </button>

              {activeDropdown === 'assignee' && (
                <div className="absolute left-0 top-full mt-1.5 w-64 max-w-[calc(100vw-3.5rem)] rounded-xl border border-white/15 bg-[#141b2d] shadow-2xl backdrop-blur-2xl z-50 p-2 space-y-1.5 animate-in fade-in zoom-in-95 duration-100">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search member or department..."
                      value={assigneeSearch}
                      onChange={(e) => setAssigneeSearch(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-0.5 pr-0.5 scrollbar-none">
                    {filteredEmployees.map((emp) => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => {
                          setEmployeeId(emp.id);
                          setActiveDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                          employeeId === emp.id ? 'bg-primary/25 text-white' : 'hover:bg-white/10 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar className="size-5 shrink-0 ring-1 ring-white/15">
                            {emp.photoUrl && <AvatarImage src={emp.photoUrl} alt={emp.firstName} />}
                            <AvatarFallback className="bg-[#252175] text-[#f37021] text-[9px] font-bold">
                              {getInitials(emp.firstName, emp.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-left truncate">
                            <p className="font-semibold truncate">
                              {emp.firstName} {emp.lastName}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {emp.departmentName || 'Staff'} · {emp.employeeCode}
                            </p>
                          </div>
                        </div>
                        {employeeId === emp.id && <Check className="size-3.5 text-primary shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Due Date Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'date' ? null : 'date')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  activeDropdown === 'date'
                    ? 'border-primary bg-primary/20 text-white'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                <Calendar className="size-3.5 text-slate-400" />
                <span>
                  {dueDate ? new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Due date'}
                </span>
                <ChevronDown className="size-3 text-slate-400 opacity-60" />
              </button>

              {activeDropdown === 'date' && (
                <div className="absolute left-0 top-full mt-1.5 w-52 max-w-[calc(100vw-3.5rem)] rounded-xl border border-white/15 bg-[#141b2d] shadow-2xl backdrop-blur-2xl z-50 p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Set Due Date
                  </div>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => {
                      setDueDate(e.target.value);
                      setActiveDropdown(null);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {dueDate && (
                    <button
                      type="button"
                      onClick={() => {
                        setDueDate('');
                        setActiveDropdown(null);
                      }}
                      className="w-full text-center text-[11px] text-rose-400 hover:underline pt-1"
                    >
                      Clear deadline
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 5. Project / Category Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  activeDropdown === 'category'
                    ? 'border-primary bg-primary/20 text-white'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                <Tag className="size-3.5 text-slate-400" />
                <span>#{category}</span>
                <ChevronDown className="size-3 text-slate-400 opacity-60" />
              </button>

              {activeDropdown === 'category' && (
                <div className="absolute left-0 top-full mt-1.5 w-48 max-w-[calc(100vw-3.5rem)] rounded-xl border border-white/15 bg-[#141b2d] shadow-2xl backdrop-blur-2xl z-50 p-2 space-y-1.5 animate-in fade-in zoom-in-95 duration-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Category Tag
                  </div>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Custom category..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <div className="flex flex-wrap gap-1 pt-1">
                    {QUICK_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setCategory(cat);
                          setActiveDropdown(null);
                        }}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md transition-colors ${
                          category === cat ? 'bg-primary text-white' : 'bg-white/5 hover:bg-white/10 text-slate-300'
                        }`}
                      >
                        #{cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Linear Bottom Footer Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-white/8 bg-[#090e18]/80 rounded-b-2xl">
          {/* Create More toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-400 hover:text-slate-200 transition-colors">
            <input
              type="checkbox"
              checked={createMore}
              onChange={(e) => setCreateMore(e.target.checked)}
              className="rounded bg-white/10 border-white/20 text-[#252175] focus:ring-0 focus:ring-offset-0 size-3.5"
            />
            <span>Create more</span>
          </label>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isSubmitting || !title.trim()}
              onClick={() => handleSubmit()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#252175] via-[#352f9c] to-[#4338ca] hover:from-[#1e1a5f] hover:to-[#3730a3] text-white shadow-lg shadow-[#252175]/40 ring-1 ring-white/15 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span>{isSubmitting ? 'Creating...' : 'Create Task'}</span>
              <kbd className="hidden sm:inline-block rounded bg-white/20 px-1.5 py-0.2 text-[10px] font-mono text-white/90">
                ↵
              </kbd>
            </button>
          </div>
        </div>
      </div>
      </DialogContent>
    </Dialog>
  );
}
