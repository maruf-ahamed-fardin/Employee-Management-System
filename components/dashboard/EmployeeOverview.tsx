import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface RecentEmployee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: { name: string };
  position?: { title: string };
  status: string;
}

export function EmployeeOverview({ employees = [] }: { employees?: RecentEmployee[] }) {
  return (
    <Card className="col-span-full lg:col-span-4">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Recent Joiners</CardTitle>
          <CardDescription>Latest team additions</CardDescription>
        </div>
        <Link
          href="/employees"
          className="text-xs font-bold text-primary hover:text-[#f37021] dark:hover:text-[#fb923c] hover:underline inline-flex items-center gap-0.5 transition-colors"
        >
          View all
          <ArrowUpRight className="size-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-3 pt-1">
        {employees.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No recent employees</p>
        ) : (
          employees.slice(0, 5).map((emp) => (
            <div
              key={emp.id}
              className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  initials={`${emp.firstName[0] || ''}${emp.lastName[0] || ''}`}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {emp.firstName} {emp.lastName}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {emp.position?.title || 'Team Member'}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px] shrink-0 font-mono">
                {emp.employeeCode}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
