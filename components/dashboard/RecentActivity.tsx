import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CheckCircle2, Clock, UserPlus, FileText } from 'lucide-react';

const activities = [
  {
    id: 1,
    title: 'New employee onboarded',
    detail: 'Anika Rahman joined as Senior UX Designer',
    time: '25 mins ago',
    icon: UserPlus,
    color: 'text-indigo-500 bg-indigo-500/10',
  },
  {
    id: 2,
    title: 'Leave request approved',
    detail: '3-day sick leave approved for Tanvir Ahmed',
    time: '2 hours ago',
    icon: CheckCircle2,
    color: 'text-emerald-500 bg-emerald-500/10',
  },
  {
    id: 3,
    title: 'Attendance closed',
    detail: 'Daily attendance logs processed for 48 employees',
    time: '4 hours ago',
    icon: Clock,
    color: 'text-amber-500 bg-amber-500/10',
  },
  {
    id: 4,
    title: 'Payroll run generated',
    detail: 'Monthly draft payroll calculated for review',
    time: 'Yesterday',
    icon: FileText,
    color: 'text-purple-500 bg-purple-500/10',
  },
];

export function RecentActivity() {
  return (
    <Card className="col-span-full">
      <CardHeader className="pb-3">
        <CardTitle>Recent System Activity</CardTitle>
        <CardDescription>Real-time audit log of actions and HR events</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-1">
        {activities.map((act) => {
          const Icon = act.icon;
          return (
            <div
              key={act.id}
              className="flex items-start gap-3.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className={`p-2 rounded-xl shrink-0 ${act.color}`}>
                <Icon className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{act.title}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{act.detail}</p>
              </div>
              <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap shrink-0">
                {act.time}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
