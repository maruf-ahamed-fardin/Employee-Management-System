'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState('SeloraX Enterprise Ltd');
  const [workStartTime, setWorkStartTime] = useState('09:00');
  const [workEndTime, setWorkEndTime] = useState('17:00');
  const [gracePeriod, setGracePeriod] = useState(15);
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('Asia/Dhaka (UTC+6)');
  const [annualLeaveQuota, setAnnualLeaveQuota] = useState(15);
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Organization settings updated successfully!');
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          System & Organization Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure work shifts, punctuality thresholds, company metadata, and HR policies
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Info */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Profile</CardTitle>
            <CardDescription>Primary company identity displayed on digital badges and payslips</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Company Name</label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Currency Code</label>
              <Input
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Default Corporate Timezone</label>
              <Input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                required
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Attendance Policy */}
        <Card>
          <CardHeader>
            <CardTitle>Work Schedule & Punctuality Policy</CardTitle>
            <CardDescription>Standard office shift timings and automatic late calculation</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Shift Start Time</label>
              <Input
                type="time"
                value={workStartTime}
                onChange={(e) => setWorkStartTime(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Shift End Time</label>
              <Input
                type="time"
                value={workEndTime}
                onChange={(e) => setWorkEndTime(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Grace Period (Minutes)</label>
              <Input
                type="number"
                value={gracePeriod}
                onChange={(e) => setGracePeriod(Number(e.target.value))}
                required
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Leave Policy */}
        <Card>
          <CardHeader>
            <CardTitle>Leave Policy Configuration</CardTitle>
            <CardDescription>Yearly quotas allocated to new joiners</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Default Annual Paid Days</label>
              <Input
                type="number"
                value={annualLeaveQuota}
                onChange={(e) => setAnnualLeaveQuota(Number(e.target.value))}
                required
                className="mt-1"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-4">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving Changes...' : 'Save Settings'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
