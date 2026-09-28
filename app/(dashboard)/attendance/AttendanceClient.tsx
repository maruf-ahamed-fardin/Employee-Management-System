'use client';

import { useState } from 'react';
import { CheckInCard } from '@/components/attendance/CheckInCard';
import { CorrectionDialog } from '@/components/attendance/CorrectionDialog';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatTime, formatDuration } from '@/lib/utils/date';
import { Calendar, Filter, Pencil } from 'lucide-react';

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

  const fetchAttendance = async (date: string, depId: string, status: string) => {
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
    } catch {}
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    fetchAttendance(newDate, departmentId, statusFilter);
  };

  const handleDepartmentChange = (newDep: string) => {
    setDepartmentId(newDep);
    fetchAttendance(selectedDate, newDep, statusFilter);
  };

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    fetchAttendance(selectedDate, departmentId, newStatus);
  };

  return (
    <div className="space-y-6">
      {/* 1. Interactive Check In / Check Out Card */}
      <CheckInCard
        initialAttendance={initialToday}
        onRefresh={() => fetchAttendance(selectedDate, departmentId, statusFilter)}
      />

      {/* 2. Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-slate-400" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-40 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="size-4 text-slate-400" />
          <select
            value={departmentId}
            onChange={(e) => handleDepartmentChange(e.target.value)}
            className="h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            <option value="">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="LATE">Late</option>
            <option value="ABSENT">Absent</option>
            <option value="ON_LEAVE">On Leave</option>
          </select>

          <CorrectionDialog
            employees={employees}
            defaultDate={selectedDate}
            onSuccess={() => fetchAttendance(selectedDate, departmentId, statusFilter)}
          />
        </div>
      </div>

      {/* 3. Daily Attendance Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>First In</TableHead>
              <TableHead>Last Out</TableHead>
              <TableHead>Worked Hours</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                  No attendance records logged for {selectedDate}.
                </TableCell>
              </TableRow>
            ) : (
              list.map((item) => {
                const fullName = `${item.employee?.firstName || ''} ${item.employee?.lastName || ''}`;
                const initials = `${item.employee?.firstName?.[0] || ''}${item.employee?.lastName?.[0] || ''}`;

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar initials={initials || 'EM'} size="sm" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-xs">
                            {fullName || 'Staff Member'}
                          </p>
                          <p className="font-mono text-[10px] text-slate-400">
                            {item.employee?.employeeCode}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                      {item.employee?.department?.name || 'General'}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                      {formatTime(item.firstInAt)}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                      {formatTime(item.lastOutAt)}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatDuration(item.workedMinutes)}
                    </TableCell>
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
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
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
                            className="size-8 text-[#252175] dark:text-[#F37021] hover:bg-[#252175]/10"
                            title="Edit / Correct Time"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                        }
                        onSuccess={() => fetchAttendance(selectedDate, departmentId, statusFilter)}
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
  );
}
