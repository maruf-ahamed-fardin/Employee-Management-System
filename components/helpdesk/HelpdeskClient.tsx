'use client';

import React, { useState } from 'react';
import {
  LifeBuoy,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Laptop,
  CalendarDays,
  DollarSign,
  MessageSquare,
  Sparkles,
  ChevronRight,
  User,
  ShieldCheck,
  Send,
  X,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/format';

export interface TicketItem {
  id: string;
  ticketNumber: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  description: string;
  employeeId: string;
  assignedToId?: string | null;
  resolution?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  employee: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    photoUrl?: string | null;
    department?: { name: string } | null;
    position?: { title: string } | null;
  };
  assignedTo?: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export interface EmployeeOption {
  id: string;
  name: string;
  code: string;
}

const CATEGORY_MAP: Record<string, { label: string; icon: any; color: string }> = {
  SALARY_CERTIFICATE: {
    label: 'Salary Certificate',
    icon: DollarSign,
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  LEAVE_QUERY: {
    label: 'Leave & Attendance',
    icon: CalendarDays,
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  IT_HARDWARE: {
    label: 'IT & Hardware',
    icon: Laptop,
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },
  EXPENSE_ISSUE: {
    label: 'Expense Claim',
    icon: FileText,
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  WORKPLACE_GENERAL: {
    label: 'Workplace & Facility',
    icon: LifeBuoy,
    color: 'bg-[#f37021]/10 text-[#f37021] dark:text-[#fb923c] border-[#f37021]/20',
  },
  OTHER: {
    label: 'General Inquiry',
    icon: MessageSquare,
    color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  },
};

const PRIORITY_MAP: Record<string, { label: string; badge: string }> = {
  LOW: { label: 'Low', badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' },
  MEDIUM: { label: 'Medium', badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  HIGH: { label: 'High', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  URGENT: { label: 'Urgent', badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-bold' },
};

const STATUS_MAP: Record<string, { label: string; badge: string; dot: string }> = {
  OPEN: { label: 'Open', badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', dot: 'bg-blue-500' },
  IN_PROGRESS: { label: 'In Progress', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', dot: 'bg-amber-500' },
  RESOLVED: { label: 'Resolved', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500' },
  CLOSED: { label: 'Closed', badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20', dot: 'bg-slate-500' },
};

export function HelpdeskClient({
  initialTickets,
  employees,
}: {
  initialTickets: TicketItem[];
  employees: EmployeeOption[];
}) {
  const [tickets, setTickets] = useState<TicketItem[]>(initialTickets);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('SALARY_CERTIFICATE');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [employeeId, setEmployeeId] = useState(employees[0]?.id || '');
  const [submitting, setSubmitting] = useState(false);

  // Resolution state inside details modal
  const [resolutionNote, setResolutionNote] = useState('');
  const [updating, setUpdating] = useState(false);

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      search.trim() === '' ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      `${t.employee.firstName} ${t.employee.lastName}`.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Stats
  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !employeeId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, priority, description, employeeId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      // Refresh list locally
      setTickets((prev) => [data.data, ...prev]);
      toast.success('Helpdesk ticket submitted successfully!');
      setCreateModalOpen(false);
      setTitle('');
      setDescription('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          resolution: resolutionNote.trim() ? resolutionNote : undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, ...data.data } : t))
      );
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket((prev) => (prev ? { ...prev, ...data.data } : null));
      }
      toast.success(`Ticket marked as ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update ticket');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setTickets((prev) => prev.filter((t) => t.id !== ticketId));
      setSelectedTicket(null);
      toast.success('Ticket deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete ticket');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              HR Helpdesk & Requests
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary">
              <LifeBuoy className="size-3 text-[#f37021]" />
              <span>{totalCount} Total</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Submit, track, and manage employee service requests, certificate letters, and inquiries.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="gap-2 bg-gradient-to-r from-[#252175] to-[#4f46e5] text-white shadow-md shadow-[#252175]/20 hover:opacity-95 rounded-xl cursor-pointer"
        >
          <Plus className="size-4" />
          <span>New Ticket</span>
        </Button>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl p-4.5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Tickets</span>
            <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <LifeBuoy className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-foreground">{totalCount}</p>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 backdrop-blur-xl p-4.5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Open Tickets</span>
            <div className="size-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <AlertCircle className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-foreground">{openCount}</p>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-xl p-4.5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">In Progress</span>
            <div className="size-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-foreground">{inProgressCount}</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl p-4.5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Resolved</span>
            <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-foreground">{resolvedCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tickets, number, or employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 rounded-xl border border-input bg-card pl-9 pr-3 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-input bg-card px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 rounded-xl border border-input bg-card px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="SALARY_CERTIFICATE">Salary Certificate</option>
            <option value="LEAVE_QUERY">Leave & Attendance</option>
            <option value="IT_HARDWARE">IT & Hardware</option>
            <option value="EXPENSE_ISSUE">Expense Claim</option>
            <option value="WORKPLACE_GENERAL">Workplace & Facility</option>
          </select>
        </div>
      </div>

      {/* Tickets List Card */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
        <div className="divide-y divide-border/60">
          {filteredTickets.map((ticket) => {
            const cat = CATEGORY_MAP[ticket.category] || CATEGORY_MAP.OTHER;
            const pri = PRIORITY_MAP[ticket.priority] || PRIORITY_MAP.MEDIUM;
            const sta = STATUS_MAP[ticket.status] || STATUS_MAP.OPEN;
            const CatIcon = cat.icon;

            return (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-muted/30 transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={cn(
                      'size-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5',
                      cat.color
                    )}
                  >
                    <CatIcon className="size-5" />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10">
                        {ticket.ticketNumber}
                      </span>
                      <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                        {ticket.title}
                      </h3>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {ticket.description}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                      <span className="font-medium text-foreground">
                        {ticket.employee.firstName} {ticket.employee.lastName}
                      </span>
                      <span>•</span>
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border',
                      sta.badge
                    )}
                  >
                    <span className={cn('size-1.5 rounded-full', sta.dot)} />
                    {sta.label}
                  </span>

                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-md text-[10px] font-semibold border',
                      pri.badge
                    )}
                  >
                    {pri.label}
                  </span>

                  <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}

          {filteredTickets.length === 0 && (
            <div className="text-center py-16">
              <LifeBuoy className="size-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-bold text-foreground">No tickets match your filter</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try changing your search keywords or create a new request.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-lg bg-card border-border shadow-2xl rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">New Helpdesk Request</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Submit an official request to the HR, Administration, or Operations team.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Requester Employee *
              </label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs"
                >
                  <option value="SALARY_CERTIFICATE">Salary Certificate</option>
                  <option value="LEAVE_QUERY">Leave & Attendance</option>
                  <option value="IT_HARDWARE">IT & Hardware</option>
                  <option value="EXPENSE_ISSUE">Expense Claim</option>
                  <option value="WORKPLACE_GENERAL">Workplace & Facility</option>
                  <option value="OTHER">Other / General</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Priority *
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Subject / Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Request for Salary Certificate for Embassy"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Detailed Description *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Provide details of your request, purpose, and any specific deadlines..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-input bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-primary text-white shadow-sm"
              >
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Ticket Details & Resolution Modal */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="max-w-xl bg-card border-border shadow-2xl rounded-2xl p-6">
            <DialogHeader className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                  {selectedTicket.ticketNumber}
                </span>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded text-[11px] font-bold border',
                    (PRIORITY_MAP[selectedTicket.priority] || PRIORITY_MAP.MEDIUM).badge
                  )}
                >
                  {(PRIORITY_MAP[selectedTicket.priority] || PRIORITY_MAP.MEDIUM).label} Priority
                </span>
              </div>
              <DialogTitle className="text-lg font-bold text-foreground pt-1">
                {selectedTicket.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs">
              {/* Employee Info Box */}
              <div className="p-3 rounded-xl border border-border/70 bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10 ring-1 ring-border bg-card">
                    {selectedTicket.employee.photoUrl && (
                      <AvatarImage src={selectedTicket.employee.photoUrl} />
                    )}
                    <AvatarFallback className="font-bold text-xs bg-primary/10 text-primary">
                      {selectedTicket.employee.firstName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-foreground">
                      {selectedTicket.employee.firstName} {selectedTicket.employee.lastName}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {selectedTicket.employee.department?.name} · {selectedTicket.employee.employeeCode}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground block">Submitted On</span>
                  <span className="font-semibold text-foreground">
                    {new Date(selectedTicket.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <span className="font-semibold text-muted-foreground block">Request Details</span>
                <p className="p-3 rounded-xl border border-border bg-card text-foreground whitespace-pre-line leading-relaxed">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Resolution Note if any */}
              {selectedTicket.resolution && (
                <div className="space-y-1">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 block flex items-center gap-1">
                    <CheckCircle2 className="size-3.5" />
                    Resolution Note
                  </span>
                  <p className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-foreground leading-relaxed">
                    {selectedTicket.resolution}
                  </p>
                </div>
              )}

              {/* Status Update Actions for HR Admin */}
              <div className="pt-2 border-t border-border/60 space-y-3">
                <span className="font-semibold text-foreground block">Update Status & Resolution</span>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={selectedTicket.status === 'OPEN' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange(selectedTicket.id, 'OPEN')}
                    disabled={updating}
                    className="h-8 text-xs rounded-lg"
                  >
                    Open
                  </Button>
                  <Button
                    type="button"
                    variant={selectedTicket.status === 'IN_PROGRESS' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange(selectedTicket.id, 'IN_PROGRESS')}
                    disabled={updating}
                    className="h-8 text-xs rounded-lg"
                  >
                    In Progress
                  </Button>
                  <Button
                    type="button"
                    variant={selectedTicket.status === 'RESOLVED' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange(selectedTicket.id, 'RESOLVED')}
                    disabled={updating}
                    className="h-8 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Resolve Ticket
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(selectedTicket.id)}
                    className="h-8 text-xs rounded-lg text-rose-600 hover:bg-rose-500/10 ml-auto"
                  >
                    <Trash2 className="size-3.5 mr-1" />
                    Delete
                  </Button>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground block">
                    Add/Edit Resolution Note (Visible to requester):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Document signed and emailed to employee."
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      className="flex-1 h-9 rounded-xl border border-input bg-card px-3 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleStatusChange(selectedTicket.id, selectedTicket.status)}
                      disabled={updating || !resolutionNote.trim()}
                      className="h-9 rounded-xl text-xs"
                    >
                      Save Note
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
