import React from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import {
  TasksKanbanClient,
  TaskItem,
  EmployeeOption,
} from '@/components/tasks/TasksKanbanClient';

export const metadata: Metadata = {
  title: 'Workload & Team Tasks | SeloraX EMS',
  description:
    'Interactive Linear-style Kanban board for team task assignment, daily deliverables, and employee workload tracking.',
};

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  const [tasksData, employeesData] = await Promise.all([
    prisma.task.findMany({
      include: {
        assignedTo: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
            department: {
              select: { name: true },
            },
            position: {
              select: { title: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.employee.findMany({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        photoUrl: true,
        department: {
          select: { name: true },
        },
        position: {
          select: { title: true },
        },
      },
      orderBy: {
        firstName: 'asc',
      },
    }),
  ]);

  const formattedTasks: TaskItem[] = tasksData.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    priority: t.priority,
    status: t.status,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    category: t.category,
    employeeId: t.employeeId,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    assignedTo: {
      id: t.assignedTo.id,
      employeeCode: t.assignedTo.employeeCode,
      firstName: t.assignedTo.firstName,
      lastName: t.assignedTo.lastName,
      photoUrl: t.assignedTo.photoUrl,
      department: t.assignedTo.department,
      position: t.assignedTo.position,
    },
  }));

  const formattedEmployees: EmployeeOption[] = employeesData.map((e) => ({
    id: e.id,
    employeeCode: e.employeeCode,
    firstName: e.firstName,
    lastName: e.lastName,
    photoUrl: e.photoUrl,
    departmentName: e.department?.name,
    positionTitle: e.position?.title,
  }));

  return (
    <TasksKanbanClient
      initialTasks={formattedTasks}
      employees={formattedEmployees}
    />
  );
}
