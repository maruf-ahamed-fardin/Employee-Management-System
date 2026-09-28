'use client';

import { useState, useMemo } from 'react';
import { EmployeeFilters } from '@/components/employees/EmployeeFilters';
import { EmployeeCard } from '@/components/employees/EmployeeCard';
import { EmployeeTable } from '@/components/employees/EmployeeTable';
import { useEmployeeStore } from '@/stores/employee.store';
import { Users } from 'lucide-react';

export function EmployeeDirectoryClient({
  initialEmployees = [],
  departments = [],
}: {
  initialEmployees: any[];
  departments: { id: string; name: string }[];
}) {
  const [employees, setEmployees] = useState<any[]>(initialEmployees);
  const { searchQuery, departmentFilter, statusFilter, viewMode } = useEmployeeStore();

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
        const code = (emp.employeeCode || '').toLowerCase();
        const email = (emp.email || '').toLowerCase();
        if (!fullName.includes(q) && !code.includes(q) && !email.includes(q)) {
          return false;
        }
      }

      // Department
      if (departmentFilter && emp.departmentId !== departmentFilter) {
        return false;
      }

      // Status
      if (statusFilter && emp.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [employees, searchQuery, departmentFilter, statusFilter]);

  const handleDelete = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Toolbar */}
      <EmployeeFilters departments={departments} />

      {/* Counter */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
        <Users className="size-3.5" />
        <span>
          Showing {filteredEmployees.length} of {employees.length} employees
        </span>
      </div>

      {/* Grid View vs Table View */}
      {viewMode === 'grid' ? (
        filteredEmployees.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              No employees matched your filter criteria
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search query or clear the department filter
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredEmployees.map((emp) => (
              <EmployeeCard key={emp.id} employee={emp} />
            ))}
          </div>
        )
      ) : (
        <EmployeeTable employees={filteredEmployees} onDelete={handleDelete} />
      )}
    </div>
  );
}
