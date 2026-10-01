'use client';

import { useState, useMemo } from 'react';
import { EmployeeFilters } from '@/components/employees/EmployeeFilters';
import { EmployeeCard } from '@/components/employees/EmployeeCard';
import { EmployeeTable } from '@/components/employees/EmployeeTable';
import { AssignTaskModal, AssignEmployeeOption } from '@/components/employees/AssignTaskModal';
import { useEmployeeStore } from '@/stores/employee.store';
import { Users, Plus, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmployeeDirectoryClient({
  initialEmployees = [],
  departments = [],
}: {
  initialEmployees: any[];
  departments: { id: string; name: string }[];
}) {
  const [employees, setEmployees] = useState<any[]>(initialEmployees);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<AssignEmployeeOption | null>(null);

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

  const handleOpenAssignModal = (employee?: any) => {
    setSelectedEmployee(employee || null);
    setAssignModalOpen(true);
  };

  const handleTaskAssigned = (createdTask: any) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === createdTask.employeeId) {
          const currentTasks = emp.tasks || [];
          return {
            ...emp,
            tasks: [createdTask, ...currentTasks.filter((t: any) => t.id !== createdTask.id)],
          };
        }
        return emp;
      })
    );
  };

  const handleTaskStatusChange = (taskId: string, newStatus: string) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        const hasTask = emp.tasks?.some((t: any) => t.id === taskId);
        if (!hasTask) return emp;
        return {
          ...emp,
          tasks: emp.tasks.map((t: any) => (t.id === taskId ? { ...t, status: newStatus } : t)),
        };
      })
    );
  };

  const totalActiveTasks = useMemo(() => {
    return employees.reduce((acc, emp) => {
      const active = (emp.tasks || []).filter((t: any) => t.status !== 'DONE').length;
      return acc + active;
    }, 0);
  }, [employees]);

  return (
    <div className="space-y-4">
      {/* Search and Filters Toolbar */}
      <EmployeeFilters departments={departments} />

      {/* Counter & Quick Global Assign Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Users className="size-3.5 text-primary" />
            <span>
              Showing {filteredEmployees.length} of {employees.length} employees
            </span>
          </div>

          <span>•</span>

          <div className="flex items-center gap-1.5 text-foreground">
            <CheckSquare className="size-3.5 text-amber-500" />
            <span>{totalActiveTasks} active tasks across team</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleOpenAssignModal(null)}
          className="h-8 gap-1.5 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10"
        >
          <Plus className="size-3.5" />
          <span>Quick Assign Task</span>
        </Button>
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
              <EmployeeCard
                key={emp.id}
                employee={emp}
                onAssignTask={handleOpenAssignModal}
                onTaskStatusChange={handleTaskStatusChange}
              />
            ))}
          </div>
        )
      ) : (
        <EmployeeTable
          employees={filteredEmployees}
          onDelete={handleDelete}
          onAssignTask={handleOpenAssignModal}
        />
      )}

      {/* Modal for Assigning Tasks */}
      <AssignTaskModal
        open={assignModalOpen}
        onOpenChange={setAssignModalOpen}
        targetEmployee={selectedEmployee}
        allEmployees={employees}
        onTaskAssigned={handleTaskAssigned}
      />
    </div>
  );
}
