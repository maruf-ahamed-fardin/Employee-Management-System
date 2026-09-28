import { prisma } from '@/lib/db';
import { UsersRound, Shield } from 'lucide-react';
import { UserManagementClient } from '@/components/users/UserManagementClient';

export const metadata = {
  title: 'User Management',
  description: 'Manage administrator logins, user accounts, and role-based permissions.',
};

export default async function UsersPage() {
  const [users, roles, unlinkedEmployees] = await Promise.all([
    prisma.user.findMany({
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            email: true,
            department: { select: { id: true, name: true } },
          },
        },
        roleRef: {
          select: { id: true, name: true, description: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.role.findMany({
      select: { id: true, name: true, description: true },
      orderBy: { name: 'asc' },
    }),
    prisma.employee.findMany({
      where: {
        status: 'ACTIVE',
        user: null, // Employees without user accounts!
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeCode: true,
        email: true,
      },
      orderBy: { firstName: 'asc' },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#252175]/10 dark:bg-[#252175]/30">
              <UsersRound className="size-6 text-[#252175] dark:text-[#F37021]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#252175] dark:text-white">
                User Management & Access Control
              </h1>
              <p className="text-sm text-muted-foreground">
                Authorize operator accounts, assign permission roles, and manage credentials.
              </p>
            </div>
          </div>
        </div>
      </div>

      <UserManagementClient
        initialUsers={users}
        roles={roles}
        unlinkedEmployees={unlinkedEmployees}
      />
    </div>
  );
}
