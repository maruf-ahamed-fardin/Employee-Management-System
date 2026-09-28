'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const data = [
  { day: 'Mon', present: 42, late: 4, absent: 2 },
  { day: 'Tue', present: 45, late: 2, absent: 1 },
  { day: 'Wed', present: 46, late: 3, absent: 0 },
  { day: 'Thu', present: 44, late: 5, absent: 2 },
  { day: 'Fri', present: 43, late: 4, absent: 3 },
  { day: 'Sat', present: 12, late: 1, absent: 0 },
  { day: 'Sun', present: 8, late: 0, absent: 0 },
];

export function AttendanceChart() {
  return (
    <Card className="col-span-full lg:col-span-8">
      <CardHeader className="pb-2">
        <CardTitle>Attendance Trends</CardTitle>
        <CardDescription>Daily presence & punctuality across all departments this week</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="lateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f37021" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f37021" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="present"
                stroke="#4f46e5"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#presentGrad)"
                name="Present"
              />
              <Area
                type="monotone"
                dataKey="late"
                stroke="#f37021"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#lateGrad)"
                name="Late"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
