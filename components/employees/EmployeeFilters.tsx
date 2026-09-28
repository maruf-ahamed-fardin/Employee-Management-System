'use client';

import { Search, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useEmployeeStore } from '@/stores/employee.store';
import { cn } from '@/lib/utils/format';

export function EmployeeFilters({
  departments = [],
}: {
  departments?: { id: string; name: string }[];
}) {
  const {
    searchQuery,
    setSearchQuery,
    departmentFilter,
    setDepartmentFilter,
    statusFilter,
    setStatusFilter,
    viewMode,
    setViewMode,
  } = useEmployeeStore();

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        <Input
          type="search"
          placeholder="Search by name, email, or code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
        />
      </div>

      {/* Select Filters & Grid/Table Switch */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Department filter */}
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-800/60 dark:border-slate-700 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-800/60 dark:border-slate-700 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="PROBATION">Probation</option>
        </select>

        {/* Grid vs Table view toggle */}
        <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-1">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            title="Grid view"
            className={cn(
              'rounded-lg p-1.5 transition-colors cursor-pointer',
              viewMode === 'grid'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            )}
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            title="Table view"
            className={cn(
              'rounded-lg p-1.5 transition-colors cursor-pointer',
              viewMode === 'table'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            )}
          >
            <List className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
