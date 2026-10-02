'use client';

import React from 'react';
import { LinearTaskModal, EmployeeSelectOption } from '@/components/tasks/LinearTaskModal';

export interface AssignEmployeeOption {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  department?: { name: string } | null;
  position?: { title: string } | null;
}

export function AssignTaskModal({
  open,
  onOpenChange,
  targetEmployee,
  allEmployees = [],
  onTaskAssigned,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetEmployee?: AssignEmployeeOption | null;
  allEmployees?: AssignEmployeeOption[];
  onTaskAssigned?: (createdTask: any) => void;
}) {
  // Format employees into EmployeeSelectOption format
  const employeePool = allEmployees.length > 0
    ? allEmployees
    : targetEmployee
    ? [targetEmployee]
    : [];

  const formattedEmployees: EmployeeSelectOption[] = employeePool.map((e) => ({
    id: e.id,
    employeeCode: e.employeeCode,
    firstName: e.firstName,
    lastName: e.lastName,
    photoUrl: e.photoUrl,
    departmentName: e.department?.name,
    positionTitle: e.position?.title,
  }));

  return (
    <LinearTaskModal
      open={open}
      onOpenChange={onOpenChange}
      employees={formattedEmployees}
      defaultEmployeeId={targetEmployee?.id}
      defaultStatus="TODO"
      onTaskCreated={onTaskAssigned}
    />
  );
}
