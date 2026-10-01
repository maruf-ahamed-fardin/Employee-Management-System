'use client';

import React, { useState } from 'react';
import {
  Receipt,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  FileText,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency, formatDate } from '@/lib/utils/date';
import { SubmitExpenseModal } from '@/components/expenses/SubmitExpenseModal';
import { toast } from 'sonner';

interface ExpenseItem {
  id: string;
  employeeId: string;
  category: string;
  title: string;
  amount: number;
  currency: string;
  receiptName?: string | null;
  notes?: string | null;
  status: string;
  createdAt: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentName?: string | null;
}

interface SummaryData {
  total: number;
  pending: number;
  approved: number;
  paid: number;
}

export function ExpensesClient({
  initialItems = [],
  initialSummary = { total: 0, pending: 0, approved: 0, paid: 0 },
  employees = [],
  userRole = 'employee',
}: {
  initialItems: ExpenseItem[];
  initialSummary: SummaryData;
  employees: any[];
  userRole: string;
}) {
  const [items, setItems] = useState<ExpenseItem[]>(initialItems);
  const [summary, setSummary] = useState<SummaryData>(initialSummary);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const canApprove = userRole === 'superadmin' || userRole === 'admin' || userRole === 'manager';

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/expenses');
      const data = await res.json();
      if (data.success) {
        setItems(data.data.items || []);
        setSummary(data.data.summary || { total: 0, pending: 0, approved: 0, paid: 0 });
      }
    } catch {}
  };

  const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REJECTED' | 'PAID') => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `Expense claim ${status.toLowerCase()}`);
        fetchExpenses();
      } else {
        toast.error(data.error || 'Failed to update claim');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredItems = items.filter((item) => {
    if (statusFilter !== 'ALL' && item.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = `${item.firstName} ${item.lastName}`.toLowerCase();
      const title = (item.title || '').toLowerCase();
      const code = (item.employeeCode || '').toLowerCase();
      if (!name.includes(q) && !title.includes(q) && !code.includes(q)) {
        return false;
      }
    }
    return true;
  });

  const getCategoryEmoji = (cat: string) => {
    switch (cat.toUpperCase()) {
      case 'TRAVEL':
        return '✈️';
      case 'MEALS':
        return '🍽️';
      case 'TRAINING':
        return '🎓';
      case 'EQUIPMENT':
        return '💻';
      case 'MEDICAL':
        return '💊';
      default:
        return '📦';
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st.toUpperCase()) {
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'APPROVED':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'PAID':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'REJECTED':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Metric Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Claims */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>Total Claimed</span>
            <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
              <Receipt className="size-3.5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">{formatCurrency(summary.total)}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">{items.length} total claims submitted</p>
        </div>

        {/* Pending Review */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>Pending Review</span>
            <span className="grid size-7 place-items-center rounded-lg bg-amber-500/10 text-amber-600">
              <Clock className="size-3.5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">
            {formatCurrency(summary.pending)}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">Awaiting manager / HR audit</p>
        </div>

        {/* Approved for Payout */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>Approved for Payout</span>
            <span className="grid size-7 place-items-center rounded-lg bg-blue-500/10 text-blue-600">
              <CheckCircle2 className="size-3.5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-blue-600 dark:text-blue-400">
            {formatCurrency(summary.approved)}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">Ready for monthly payroll disbursement</p>
        </div>

        {/* Reimbursed / Paid */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>Settled / Paid Out</span>
            <span className="grid size-7 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <DollarSign className="size-3.5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(summary.paid)}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">Disbursed into employee accounts</p>
        </div>
      </div>

      {/* 2. Controls & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-secondary/40 border border-border/80 text-xs font-semibold overflow-x-auto max-w-full">
          {['ALL', 'PENDING', 'APPROVED', 'PAID', 'REJECTED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-card text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search & Claim Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="size-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search by title, employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-9"
            />
          </div>

          <Button
            type="button"
            size="sm"
            onClick={() => setModalOpen(true)}
            className="h-9 gap-1.5 text-xs font-semibold shadow-xs shrink-0"
          >
            <Plus className="size-3.5" />
            <span>Claim Expense</span>
          </Button>
        </div>
      </div>

      {/* 3. Claims Data Table */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Expense Title & Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Voucher / Receipt</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              {canApprove && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                  No expense claims found matching criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => {
                const initials = `${item.firstName?.[0] || ''}${item.lastName?.[0] || ''}`.toUpperCase();
                const isLoading = actionLoadingId === item.id;

                return (
                  <TableRow key={item.id} className="hover:bg-muted/40">
                    {/* Employee */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8 ring-1 ring-border">
                          <AvatarFallback className="bg-[#252175] text-[#F37021] text-[10px] font-bold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-foreground text-xs leading-tight">
                            {item.firstName} {item.lastName}
                          </p>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {item.employeeCode} · {item.departmentName || 'General'}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Title & Category */}
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="font-semibold text-xs text-foreground truncate" title={item.title}>
                          {item.title}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <span>
                            {getCategoryEmoji(item.category)} {item.category}
                          </span>
                          {item.notes && <span className="truncate">· {item.notes}</span>}
                        </div>
                      </div>
                    </TableCell>

                    {/* Amount */}
                    <TableCell className="font-mono font-bold text-xs text-foreground">
                      {formatCurrency(item.amount)}
                    </TableCell>

                    {/* Receipt */}
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                        <FileText className="size-3 text-primary" />
                        <span className="max-w-[120px] truncate">
                          {item.receiptName || 'receipt.pdf'}
                        </span>
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(item.createdAt)}
                    </TableCell>

                    {/* Actions */}
                    {canApprove && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status === 'PENDING' && (
                            <>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={isLoading}
                                onClick={() => handleUpdateStatus(item.id, 'APPROVED')}
                                className="h-7 text-xs font-semibold text-blue-600 border-blue-500/20 hover:bg-blue-500/10"
                              >
                                Approve
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                disabled={isLoading}
                                onClick={() => handleUpdateStatus(item.id, 'REJECTED')}
                                className="h-7 text-xs font-semibold text-rose-500 hover:bg-rose-500/10"
                              >
                                Reject
                              </Button>
                            </>
                          )}

                          {item.status === 'APPROVED' && (
                            <Button
                              type="button"
                              size="sm"
                              variant="default"
                              disabled={isLoading}
                              onClick={() => handleUpdateStatus(item.id, 'PAID')}
                              className="h-7 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              Mark Paid
                            </Button>
                          )}

                          {item.status === 'PAID' && (
                            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                              <ShieldCheck className="size-3" />
                              Disbursed
                            </span>
                          )}

                          {item.status === 'REJECTED' && (
                            <span className="text-[11px] font-semibold text-rose-500">Rejected</span>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Submit Expense Modal */}
      <SubmitExpenseModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        employees={employees}
        onSuccess={fetchExpenses}
      />
    </div>
  );
}
