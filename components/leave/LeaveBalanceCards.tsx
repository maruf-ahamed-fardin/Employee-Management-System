import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Stethoscope, Palmtree, UserCheck } from 'lucide-react';

export function LeaveBalanceCards({
  balances = [],
}: {
  balances?: Array<{
    id: string;
    leaveTypeName: string;
    allocated: number;
    used: number;
    available: number;
  }>;
}) {
  const defaultTypes = [
    { name: 'Annual Leave', allocated: 15, used: 4, available: 11, icon: Palmtree, color: 'text-indigo-500 bg-indigo-500/10' },
    { name: 'Sick Leave', allocated: 10, used: 2, available: 8, icon: Stethoscope, color: 'text-rose-500 bg-rose-500/10' },
    { name: 'Casual Leave', allocated: 5, used: 1, available: 4, icon: Calendar, color: 'text-amber-500 bg-amber-500/10' },
    { name: 'Maternity/Paternity', allocated: 30, used: 0, available: 30, icon: UserCheck, color: 'text-emerald-500 bg-emerald-500/10' },
  ];

  const displayList = balances.length > 0
    ? balances.map((b) => ({
        name: b.leaveTypeName,
        allocated: b.allocated,
        used: b.used,
        available: b.available,
        icon: Calendar,
        color: 'text-indigo-500 bg-indigo-500/10',
      }))
    : defaultTypes;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {displayList.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.name} className="hover:border-indigo-500/30 transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {item.name}
                </span>
                <span className={`p-2 rounded-xl ${item.color}`}>
                  <Icon className="size-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {item.available}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">days left</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {item.used} / {item.allocated} used
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
