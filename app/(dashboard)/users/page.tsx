import { prisma } from '@/lib/db';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { formatDate } from '@/lib/utils/date';
import { Shield, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'User Management',
};

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    include: {
      employee: {
        include: { department: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            User Accounts & RBAC
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            System logins, role-based permission scopes, and authentication records
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Account</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Linked Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                  No registered users in database.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        initials={u.email.slice(0, 2).toUpperCase()}
                        size="sm"
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-xs">
                          {u.email}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">ID: {u.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        u.role === 'superadmin'
                          ? 'destructive'
                          : u.role === 'admin'
                          ? 'default'
                          : u.role === 'manager'
                          ? 'warning'
                          : 'secondary'
                      }
                      className="capitalize font-bold text-xs"
                    >
                      <Shield className="size-3 mr-1" />
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {u.employee ? `${u.employee.firstName} ${u.employee.lastName}` : 'Unlinked Account'}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {u.employee?.department?.name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.status === 'ACTIVE' ? 'success' : 'secondary'}>
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                    {u.lastLoginAt ? formatDate(u.lastLoginAt) : 'Never'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
