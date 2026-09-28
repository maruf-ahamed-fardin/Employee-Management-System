import { prisma } from '@/lib/db';
import { Sliders } from 'lucide-react';
import { SettingsClient } from '@/components/settings/SettingsClient';

export const metadata = {
  title: 'Organization Settings',
  description: 'Manage attendance policies, public holidays, and workspace parameters.',
};

export default async function SettingsPage() {
  const currentYear = new Date().getFullYear();

  const [settingsRecord, holidays] = await Promise.all([
    prisma.setting.findUnique({
      where: { key: 'attendance_settings' },
    }),
    prisma.holiday.findMany({
      where: {
        date: { startsWith: String(currentYear) },
      },
      orderBy: { date: 'asc' },
    }),
  ]);

  const defaultSettings = {
    workStartTime: '09:00',
    workEndTime: '17:00',
    gracePeriodMinutes: 15,
    autoCloseTime: '23:59',
    timezone: 'Asia/Dhaka',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  };

  const settings = settingsRecord ? JSON.parse(settingsRecord.value) : defaultSettings;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#252175]/10 dark:bg-[#252175]/30">
              <Sliders className="size-6 text-[#252175] dark:text-[#F37021]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#252175] dark:text-white">
                Organization & Policy Settings
              </h1>
              <p className="text-sm text-muted-foreground">
                Establish official working hours, grace periods, holiday calendars, and enterprise parameters.
              </p>
            </div>
          </div>
        </div>
      </div>

      <SettingsClient
        initialSettings={settings}
        initialHolidays={holidays}
      />
    </div>
  );
}
