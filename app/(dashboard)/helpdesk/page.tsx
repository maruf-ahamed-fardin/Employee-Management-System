import React from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { HelpdeskClient, TicketItem, EmployeeOption } from '@/components/helpdesk/HelpdeskClient';

export const metadata: Metadata = {
  title: 'HR Helpdesk & Service Requests | SeloraX EMS',
  description: 'Employee service requests, salary certificate applications, IT assistance, and ticket management.',
};

export const dynamic = 'force-dynamic';

export default async function HelpdeskPage() {
  const [ticketsData, employeesData] = await Promise.all([
    prisma.helpdeskTicket.findMany({
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
            photoUrl: true,
            department: {
              select: { name: true },
            },
            position: {
              select: { title: true },
            },
          },
        },
        assignedTo: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
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
      },
      orderBy: {
        firstName: 'asc',
      },
    }),
  ]);

  const formattedTickets: TicketItem[] = ticketsData.map((t) => ({
    id: t.id,
    ticketNumber: t.ticketNumber,
    title: t.title,
    category: t.category,
    priority: t.priority,
    status: t.status,
    description: t.description,
    employeeId: t.employeeId,
    assignedToId: t.assignedToId,
    resolution: t.resolution,
    resolvedAt: t.resolvedAt ? t.resolvedAt.toISOString() : null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    employee: {
      id: t.employee.id,
      employeeCode: t.employee.employeeCode,
      firstName: t.employee.firstName,
      lastName: t.employee.lastName,
      email: t.employee.email,
      photoUrl: t.employee.photoUrl,
      department: t.employee.department,
      position: t.employee.position,
    },
    assignedTo: t.assignedTo
      ? {
          id: t.assignedTo.id,
          employeeCode: t.assignedTo.employeeCode,
          firstName: t.assignedTo.firstName,
          lastName: t.assignedTo.lastName,
          email: t.assignedTo.email,
        }
      : null,
  }));

  const formattedEmployees: EmployeeOption[] = employeesData.map((e) => ({
    id: e.id,
    name: `${e.firstName} ${e.lastName}`,
    code: e.employeeCode,
  }));

  return <HelpdeskClient initialTickets={formattedTickets} employees={formattedEmployees} />;
}
