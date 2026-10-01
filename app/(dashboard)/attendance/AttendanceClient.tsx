'use client';

import React, { useState, useMemo } from 'react';
import { LivePunchTerminal } from '@/components/attendance/LivePunchTerminal';
import { CorrectionDialog } from '@/components/attendance/CorrectionDialog';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatTime, formatDuration } from '@/lib/utils/date';
import {
  Calendar,
  Filter,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  UserCheck,
  Clock,
  CalendarDays,
  Timer,
  LayoutGrid,
  List,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils/format';
import { toast } from 'sonner';

interface EmployeeOption {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
}

export function AttendanceClient({
  initialToday,
  initialList = [],
  departments = [],
  employees = [],
  todayDate,
}: {
  initialToday?: any;
  initialList: any[];
  departments: { id: string; name: string }[];
  employees?: EmployeeOption[];
  todayDate: string;
}) {
  const [list, setList] = useState<any[]>(initialList);
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [departmentId, setDepartmentId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [loading, setLoading] = useState(false);

  // Fetch records for date & filters
  const fetchAttendance = async (date: string, depId: string, status: string) => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (date) q.set('workDate', date);
      if (depId) q.set('departmentId', depId);
      if (status) q.set('status', status);

      const res = await fetch(`/api/attendance?${q.toString()}`);
      const data = await res.json();
      if (data.success) {
        setList(data.data.items || []);
      }
    } catch {
      toast.error('Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  // Date stepper handlers
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    fetchAttendance(newDate, departmentId, statusFilter);
  };

  const handleStepDay = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    const newDateStr = current.toISOString().split('T')[0];
    handleDateChange(newDateStr);
  };

  const handleJumpToday = () => {
    handleDateChange(todayDate);
  };

  const handleDepartmentChange = (newDep: string) => {
    setDepartmentId(newDep);
    fetchAttendance(selectedDate, newDep, statusFilter);
  };

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    fetchAttendance(selectedDate, departmentId, newStatus);
  };

  // Client-side search filtering
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((item) => {
      const name = `${item.employee?.firstName || ''} ${item.employee?.lastName || ''}`.toLowerCase();
      const code = (item.employee?.employeeCode || '').toLowerCase();
      const dept = (item.employee?.department?.name || '').toLowerCase();
      return name.includes(q) || code.includes(q) || dept.includes(q);
    });
  }, [list, searchQuery]);

  // Attendance Pulse KPIs computed from current list
  const pulseMetrics = useMemo(() => {
    const totalLogged = list.length;
    const presentCount = list.filter((i) => i.status === 'PRESENT').length;
    const lateCount = list.filter((i) => i.status === 'LATE').length;
    const onLeaveCount = list.filter((i) => i.status === 'ON_LEAVE').length;

    const totalWorkedMinutes = list.reduce(
      (sum, item) => sum + (item.workedMinutes || 0),
      0
    );
    const avgMinutes = totalLogged > 0 ? Math.round(totalWorkedMinutes / totalLogged) : 0;
    const avgHoursStr = `${Math.floor(avgMinutes / 60)}h ${avgMinutes % 60}m`;

    return {
      presentCount,
      lateCount,
      onLeaveCount,
      totalLogged,
      avgHoursStr,
      attendancePercent: totalLogged > 0 ? Math.round(((presentCount + lateCount) / totalLogged) * 100) : 0,
    };
  }, [list]);

  // Export current table view as CSV
  const handleExportCSV = () => {
    if (filteredList.length === 0) {
      toast.error('No records available to export');
      return;
    }

    const headers = [
      'Employee Code',
      'Employee Name',
      'Department',
      'Date',
      'First In',
      'Last Out',
      'Worked Minutes',
      'Worked Hours',
      'Status',
    ];

    const rows = filteredList.map((item) => {
      const name = `"${item.employee?.firstName || ''} ${item.employee?.lastName || ''}"`;
      const code = `"${item.employee?.employeeCode || ''}"`;
      const dept = `"${item.employee?.department?.name || 'General'}"`;
      const firstIn = `"${formatTime(item.firstInAt)}"`;
      const lastOut = `"${formatTime(item.lastOutAt)}"`;
      const workedMin = item.workedMinutes || 0;
      const workedFormatted = `"${formatDuration(workedMin)}"`;
      const status = `"${item.status || ''}"`;

      return [
        code,
        name,
        dept,
        `"${selectedDate}"`,
        firstIn,
        lastOut,
        workedMin,
        workedFormatted,
        status,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `selorax_attendance_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Attendance CSV downloaded successfully!');
  };

  return (
    <div className="space-y-6">
      {/* ─── 1. Futuristic Live Punch Terminal ──────────────────────────────── */}
      <LivePunchTerminal
        initialAttendance={initialToday}
        onRefresh={() => fetchAttendance(selectedDate, departmentId, statusFilter)}
      />

      {/* ─── 2. Attendance Pulse Strip (4 KPI Metric Cards) ────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Present Today */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0c1222] p-4 sm:p-5 shadow-sm transition-all hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Present Today
            </span>
            <div className="size-8 sm:size-9 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <UserCheck className="size-4 sm:size-4.5" />
            </div>
          </div>
          <p className="mt-2.5 text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
            {pulseMetrics.presentCount}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {pulseMetrics.attendancePercent}% of logged roster
          </p>
        </div>

        {/* Late Arrivals */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0c1222] p-4 sm:p-5 shadow-sm transition-all hover:border-amber-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Late Arrivals
            </span>
            <div className="size-8 sm:size-9 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Clock className="size-4 sm:size-4.5" />
            </div>
          </div>
          <p className="mt-2.5 text-2xl sm:text-3xl font-black font-mono text-amber-600 dark:text-amber-400">
            {pulseMetrics.lateCount}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Punched past 09:15 AM BST
          </p>
        </div>

        {/* On Leave */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0c1222] p-4 sm:p-5 shadow-sm transition-all hover:border-indigo-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              On Approved Leave
            </span>
            <div className="size-8 sm:size-9 rounded-xl flex items-center justify-center bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              <CalendarDays className="size-4 sm:size-4.5" />
            </div>
          </div>
          <p className="mt-2.5 text-2xl sm:text-3xl font-black font-mono text-indigo-600 dark:text-indigo-400">
            {pulseMetrics.onLeaveCount}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Official & study leaves
          </p>
        </div>

        {/* Average Worked Time */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0c1222] p-4 sm:p-5 shadow-sm transition-all hover:border-[#F37021]/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Avg Shift Length
            </span>
            <div className="size-8 sm:size-9 rounded-xl flex items-center justify-center bg-orange-500/10 text-[#F37021] border border-orange-500/20">
              <Timer className="size-4 sm:size-4.5" />
            </div>
          </div>
          <p className="mt-2.5 text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
            {pulseMetrics.avgHoursStr}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Target shift: 8h 00m
          </p>
        </div>
      </div>

      {/* ─── 3. Modern Interactive Toolbar (Date Stepper + Filters + Export) ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0c1222] shadow-sm">
        {/* Left: Quick Date Stepper (< Yesterday | Date Picker | Today | Tomorrow >) */}
        <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => handleStepDay(-1)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer active:scale-95"
            title="Previous Day"
          >
            <ChevronLeft className="size-4" />
          </button>

          <div className="relative flex items-center">
            <Calendar className="absolute left-2.5 size-4 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="h-10 pl-8 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#F37021]"
            />
          </div>

          <button
            type="button"
            onClick={() => handleStepDay(1)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer active:scale-95"
            title="Next Day"
          >
            <ChevronRight className="size-4" />
          </button>

          {selectedDate !== todayDate && (
            <button
              type="button"
              onClick={handleJumpToday}
              className="px-3 h-10 rounded-xl bg-[#F37021]/10 hover:bg-[#F37021]/20 text-[#F37021] text-xs font-bold transition-all border border-[#F37021]/30 cursor-pointer active:scale-95"
            >
              Today
            </button>
          )}
        </div>

        {/* Right: Search, Filter Selectors, Export & Correction Modal */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          {/* Real-time Search */}
          <div className="relative flex-1 sm:w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-8 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F37021]"
            />
          </div>

          {/* Department Filter */}
          <select
            value={departmentId}
            onChange={(e) => handleDepartmentChange(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="LATE">Late</option>
            <option value="ABSENT">Absent</option>
            <option value="ON_LEAVE">On Leave</option>
          </select>

          {/* View Mode Toggle (Desktop & Tablet) */}
          <div className="hidden sm:flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={cn(
                'p-1.5 rounded-lg text-xs transition-all cursor-pointer',
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              )}
              title="Table View"
            >
              <List className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded-lg text-xs transition-all cursor-pointer',
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              )}
              title="Cards Grid View"
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            title="Download CSV attendance sheet"
          >
            <Download className="size-3.5 text-[#F37021]" />
            <span className="hidden md:inline">Export CSV</span>
          </button>

          {/* Manual Correction Dialog */}
          <CorrectionDialog
            employees={employees}
            defaultDate={selectedDate}
            onSuccess={() => fetchAttendance(selectedDate, departmentId, statusFilter)}
          />
        </div>
      </div>

      {/* ─── 4. Attendance Records Display ──────────────────────────────────── */}
      {/* 4A. Desktop Table View (visible when viewMode === 'table') */}
      <div className={cn('hidden md:block', viewMode !== 'table' && 'md:hidden')}>
        <div className="rounded-3xl border border-slate-200/80 bg-white dark:bg-[#0c1222] dark:border-slate-800 overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
              <TableRow>
                <TableHead className="py-4 pl-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Employee
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Department
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  First In
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Last Out
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Shift Progress & Worked
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="pr-6 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-44 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 space-y-1">
                      <Clock className="size-8 text-slate-300 dark:text-slate-600 mb-1" />
                      <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                        No attendance records found
                      </p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        No punch activity recorded for {selectedDate}. Use "+ Manual Log" to record an entry.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredList.map((item) => {
                  const fullName = `${item.employee?.firstName || ''} ${item.employee?.lastName || ''}`;
                  const initials = `${item.employee?.firstName?.[0] || ''}${item.employee?.lastName?.[0] || ''}`;
                  const workedMin = item.workedMinutes || 0;
                  const shiftPercent = Math.min(100, Math.round((workedMin / 480) * 100));

                  return (
                    <TableRow
                      key={item.id}
                      className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/60 dark:hover:bg-[#111827]/70 transition-colors"
                    >
                      {/* Employee Profile */}
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            initials={initials || 'EM'}
                            size="sm"
                            className="ring-2 ring-slate-100 dark:ring-slate-800"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-xs hover:text-[#F37021] transition-colors">
                              {fullName || 'Staff Member'}
                            </p>
                            <span className="font-mono text-[10px] text-slate-400">
                              {item.employee?.employeeCode}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Department */}
                      <TableCell className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {item.employee?.department?.name || 'General'}
                      </TableCell>

                      {/* First In */}
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                          <span
                            className={cn(
                              'size-1.5 rounded-full',
                              item.status === 'LATE' ? 'bg-amber-500' : 'bg-emerald-500'
                            )}
                          />
                          {formatTime(item.firstInAt)}
                        </span>
                      </TableCell>

                      {/* Last Out */}
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg font-mono text-xs font-bold bg-slate-100/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                          {formatTime(item.lastOutAt)}
                        </span>
                      </TableCell>

                      {/* Shift Progress Bar & Hours */}
                      <TableCell>
                        <div className="space-y-1.5 max-w-[140px]">
                          <div className="flex items-baseline justify-between text-xs">
                            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                              {formatDuration(workedMin)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {shiftPercent}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#F37021]"
                              style={{ width: `${Math.max(shiftPercent, 6)}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell>
                        <Badge
                          variant={
                            item.status === 'PRESENT'
                              ? 'success'
                              : item.status === 'LATE'
                              ? 'warning'
                              : item.status === 'ON_LEAVE'
                              ? 'default'
                              : 'destructive'
                          }
                          className="font-bold text-[10px] px-2 py-0.5 rounded-md"
                        >
                          {item.status}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="pr-6 text-right">
                        <CorrectionDialog
                          employees={employees}
                          defaultDate={selectedDate}
                          record={{
                            id: item.id,
                            employeeId: item.employeeId,
                            workDate: item.workDate,
                            status: item.status,
                            firstInAt: item.firstInAt,
                            lastOutAt: item.lastOutAt,
                            note: item.note,
                          }}
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-lg text-slate-600 dark:text-slate-300 hover:text-[#F37021] hover:bg-[#F37021]/10 transition-colors"
                              title="Edit / Correct Time"
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                          }
                          onSuccess={() =>
                            fetchAttendance(selectedDate, departmentId, statusFilter)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 4B. Mobile Cards View & Grid Mode (Visible on Mobile by default, or Desktop when grid mode is active) */}
      <div
        className={cn(
          'space-y-3',
          viewMode === 'table' ? 'block md:hidden' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 space-y-0'
        )}
      >
        {filteredList.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1222] p-8 text-center text-slate-400">
            <Clock className="size-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
              No attendance records found
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              No logs for {selectedDate}.
            </p>
          </div>
        ) : (
          filteredList.map((item) => {
            const fullName = `${item.employee?.firstName || ''} ${item.employee?.lastName || ''}`;
            const initials = `${item.employee?.firstName?.[0] || ''}${item.employee?.lastName?.[0] || ''}`;
            const workedMin = item.workedMinutes || 0;
            const shiftPercent = Math.min(100, Math.round((workedMin / 480) * 100));

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c1222] p-4 shadow-sm hover:border-[#F37021]/40 transition-all"
              >
                {/* Card Top: Avatar, Name & Status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar initials={initials || 'EM'} size="sm" />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {fullName || 'Staff Member'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">
                        {item.employee?.employeeCode} · {item.employee?.department?.name || 'General'}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant={
                      item.status === 'PRESENT'
                        ? 'success'
                        : item.status === 'LATE'
                        ? 'warning'
                        : item.status === 'ON_LEAVE'
                        ? 'default'
                        : 'destructive'
                    }
                    className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                  >
                    {item.status}
                  </Badge>
                </div>

                {/* Timestamps Row */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 text-center mb-3">
                  <div>
                    <span className="text-[9px] font-bold uppercase text-slate-400 block">
                      First In
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                      {formatTime(item.firstInAt)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase text-slate-400 block">
                      Last Out
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                      {formatTime(item.lastOutAt)}
                    </span>
                  </div>
                </div>

                {/* Shift Worked Progress Bar */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Worked Time:
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatDuration(workedMin)} ({shiftPercent}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#F37021]"
                      style={{ width: `${Math.max(shiftPercent, 6)}%` }}
                    />
                  </div>
                </div>

                {/* Action Edit */}
                <div className="flex justify-end pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <CorrectionDialog
                    employees={employees}
                    defaultDate={selectedDate}
                    record={{
                      id: item.id,
                      employeeId: item.employeeId,
                      workDate: item.workDate,
                      status: item.status,
                      firstInAt: item.firstInAt,
                      lastOutAt: item.lastOutAt,
                      note: item.note,
                    }}
                    trigger={
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#F37021] hover:underline cursor-pointer"
                      >
                        <Pencil className="size-3" />
                        <span>Edit Punch Log</span>
                      </button>
                    }
                    onSuccess={() =>
                      fetchAttendance(selectedDate, departmentId, statusFilter)
                    }
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
