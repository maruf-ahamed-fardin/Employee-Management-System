'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Briefcase,
  UserCheck,
  Droplet,
  Edit3,
  FileText,
  CreditCard,
  QrCode as QrIcon,
  Download,
  Share2,
  CheckSquare,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Laptop,
  ChevronRight,
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatDate, formatCurrency } from '@/lib/utils/date';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AssignTaskModal } from '@/components/employees/AssignTaskModal';
import { toast } from 'sonner';

export function EmployeeProfile({
  employee,
  assets = [],
}: {
  employee: any;
  assets?: any[];
}) {
  const [qrOpen, setQrOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [tasks, setTasks] = useState<any[]>(employee.tasks || []);
  const fullName = `${employee.firstName} ${employee.lastName}`;
  const initials = `${employee.firstName[0] || ''}${employee.lastName[0] || ''}`.toUpperCase();

  let address: any = {};
  let emergency: any = {};
  try {
    address = typeof employee.address === 'string' ? JSON.parse(employee.address) : employee.address || {};
    emergency = typeof employee.emergencyContact === 'string' ? JSON.parse(employee.emergencyContact) : employee.emergencyContact || {};
  } catch {}

  const handleDownloadVCard = () => {
    const vCardData = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${fullName}`,
      `N:${employee.lastName};${employee.firstName};;;`,
      `ORG:SeloraX;${employee.department?.name || 'Department'}`,
      `TITLE:${employee.position?.title || 'Staff'}`,
      `EMAIL;TYPE=WORK:${employee.email}`,
      `TEL;TYPE=WORK:${employee.businessPhone || employee.phone}`,
      `NOTE:SeloraX Employee Code: ${employee.employeeCode}`,
      'END:VCARD',
    ].join('\r\n');

    const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${employee.employeeCode}-${fullName.replace(/\s+/g, '_')}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Contact saved for ${fullName}`);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="h-40 bg-gradient-to-r from-[#1d1b4f] via-[#3b2aa8] to-[#7b3fe4] relative">
          <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="rounded-lg bg-white/20 px-3 py-1 font-mono text-xs font-bold text-white backdrop-blur-md">
              {employee.employeeCode}
            </span>
          </div>
        </div>

        <div className="px-6 pb-6 pt-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <Avatar initials={initials} src={employee.photoUrl} size="xl" className="border-4 border-white dark:border-slate-900 shadow-lg" />
              <div className="mb-2">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {fullName}
                  </h1>
                  <Badge variant={employee.status === 'ACTIVE' ? 'success' : 'secondary'}>
                    {employee.status}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  {employee.position?.title || 'Team Member'} · {employee.department?.name || 'Department'}
                </p>
                {employee.headline && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-1 max-w-lg">
                    “{employee.headline}”
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-center mb-2">
              <Button variant="outline" size="sm" onClick={handleDownloadVCard}>
                <Download className="size-3.5 mr-1" />
                vCard
              </Button>
              <Button variant="outline" size="sm" onClick={() => setQrOpen(true)}>
                <QrIcon className="size-3.5 mr-1" />
                QR Code
              </Button>
              <Link href={`/employees/${employee.id}/documents`}>
                <Button variant="outline" size="sm">
                  <FileText className="size-3.5 mr-1" />
                  Documents
                </Button>
              </Link>
              <Link href={`/employees/${employee.id}/edit`}>
                <Button size="sm">
                  <Edit3 className="size-3.5 mr-1" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Quick Contact & Metadata */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500">
                  <Mail className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Work Email</p>
                  <a href={`mailto:${employee.email}`} className="font-semibold text-slate-800 dark:text-slate-200 truncate hover:text-primary transition-colors">
                    {employee.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500">
                  <Phone className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Personal Phone</p>
                  <a href={`tel:${employee.phone}`} className="font-semibold text-slate-800 dark:text-slate-200 truncate hover:text-primary transition-colors">
                    {employee.phone}
                  </a>
                </div>
              </div>

              {employee.businessPhone && (
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500">
                    <Phone className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-slate-400 text-[10px] uppercase font-bold">Direct / Business</p>
                    <a href={`tel:${employee.businessPhone}`} className="font-semibold text-slate-800 dark:text-slate-200 truncate hover:text-primary transition-colors">
                      {employee.businessPhone}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500">
                  <MapPin className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Work Location</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {employee.workLocation || 'Dhaka HQ, Bangladesh'}
                  </p>
                </div>
              </div>

              {employee.bloodGroup && (
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    <Droplet className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-slate-400 text-[10px] uppercase font-bold">Blood Group</p>
                    <p className="font-semibold text-rose-600 dark:text-rose-400">
                      {employee.bloodGroup}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {emergency.name || 'Not provided'}
              </p>
              <p className="text-slate-500">
                Relationship: <span className="font-semibold text-slate-700 dark:text-slate-300">{emergency.relationship || 'N/A'}</span>
              </p>
              <p className="text-slate-500">
                Phone: <span className="font-semibold text-slate-700 dark:text-slate-300">{emergency.phone || 'N/A'}</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right 2 Columns: Employment, Department, Reports */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Employment Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 font-semibold">Department</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {employee.department?.name || 'General'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 font-semibold">Designation</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {employee.position?.title || 'Staff'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 font-semibold">Employment Type</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 capitalize">
                  {employee.employmentType?.replace(/_/g, ' ') || 'Full Time'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 font-semibold">Date of Joining</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {formatDate(employee.joiningDate)}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 font-semibold">Base Compensation</span>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatCurrency(employee.salary || 65000)} / mo
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 font-semibold">Direct Reports</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {employee.directReports?.length || 0} direct reports
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Work & Tasks Card */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckSquare className="size-4 text-primary" />
                  <span>Assigned Tasks & Workload ({tasks.length})</span>
                </CardTitle>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setAssignOpen(true)}
                className="h-8 gap-1.5 text-xs font-semibold"
              >
                <Plus className="size-3.5" />
                <span>Assign Task</span>
              </Button>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No active tasks assigned to this employee.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {tasks.map((task) => {
                    const isDone = task.status === 'DONE';
                    return (
                      <div
                        key={task.id}
                        className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs transition-all ${
                          isDone
                            ? 'border-border/40 bg-card/40 opacity-60'
                            : 'border-border bg-card shadow-2xs hover:border-primary/30'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            const nextStatus = isDone ? 'IN_PROGRESS' : 'DONE';
                            setTasks((prev) =>
                              prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
                            );
                            fetch(`/api/tasks/${task.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: nextStatus }),
                            }).then((r) => r.json()).then((d) => {
                              if (d.success) toast.success(`Task status updated`);
                            });
                          }}
                          className="mt-0.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer shrink-0"
                          title={isDone ? 'Mark as In Progress' : 'Mark as Done'}
                        >
                          {isDone ? (
                            <CheckCircle2 className="size-4 text-emerald-600" />
                          ) : (
                            <Circle className="size-4" />
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <p
                            className={`font-semibold ${
                              isDone ? 'line-through text-muted-foreground' : 'text-foreground'
                            }`}
                          >
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px]">
                            <span className="rounded px-1.5 py-0.5 font-bold uppercase bg-primary/10 text-primary">
                              {task.priority}
                            </span>
                            {task.category && (
                              <span className="text-muted-foreground font-mono">#{task.category}</span>
                            )}
                            {task.dueDate && (
                              <span className="text-muted-foreground">
                                Due {formatDate(task.dueDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assigned Hardware & Assets */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Laptop className="size-4 text-indigo-500" />
                  <span>Assigned Hardware & Assets ({assets.length})</span>
                </CardTitle>
              </div>
              <Link
                href="/assets"
                className="text-xs text-indigo-500 hover:text-indigo-400 font-medium flex items-center gap-1"
              >
                <span>Inventory Hub</span>
                <ChevronRight className="size-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {assets.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No company hardware or devices currently issued to this employee.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {assets.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-xs text-slate-900 dark:text-white">
                            {item.name}
                          </div>
                          {item.model && (
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {item.model}
                            </div>
                          )}
                        </div>
                        <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 shrink-0">
                          {item.assetTag}
                        </span>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-mono">SN: {item.serialNumber || 'N/A'}</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{item.condition}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reporting Line */}
          {employee.manager && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Reporting Manager</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar initials={`${employee.manager.firstName[0]}${employee.manager.lastName[0]}`} size="md" />
                  <div>
                    <Link
                      href={`/employees/${employee.manager.id}`}
                      className="font-bold text-sm text-slate-900 dark:text-white hover:text-primary transition-colors"
                    >
                      {employee.manager.firstName} {employee.manager.lastName}
                    </Link>
                    <p className="text-xs text-slate-400">Department Lead / Manager</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Direct Reports */}
          {employee.directReports && employee.directReports.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Team Members Under Supervision</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {employee.directReports.map((report: any) => (
                  <div key={report.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <Avatar initials={`${report.firstName[0]}${report.lastName[0]}`} size="sm" />
                    <div className="min-w-0">
                      <Link href={`/employees/${report.id}`} className="text-xs font-bold text-slate-900 dark:text-white truncate hover:underline block">
                        {report.firstName} {report.lastName}
                      </Link>
                      <p className="text-[11px] text-slate-400 truncate">{report.position?.title || 'Associate'}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* QR Dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-xs text-center">
          <DialogHeader>
            <DialogTitle>{fullName}</DialogTitle>
            <DialogDescription>SeloraX Digital ID QR</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-200 dark:border-slate-700 my-2">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                typeof window !== 'undefined' ? `${window.location.origin}/employees/${employee.id}` : ''
              )}`}
              alt="QR Code"
              className="size-44 object-contain"
            />
            <p className="mt-2 text-xs font-mono font-bold text-slate-700">{employee.employeeCode}</p>
          </div>
          <Button variant="secondary" onClick={() => setQrOpen(false)} className="w-full">
            Done
          </Button>
        </DialogContent>
      </Dialog>

      {/* Assign Task Modal */}
      <AssignTaskModal
        open={assignOpen}
        onOpenChange={setAssignOpen}
        targetEmployee={{
          id: employee.id,
          employeeCode: employee.employeeCode,
          firstName: employee.firstName,
          lastName: employee.lastName,
          photoUrl: employee.photoUrl,
          department: employee.department,
          position: employee.position,
        }}
        onTaskAssigned={(newTask) => {
          setTasks((prev) => [newTask, ...prev]);
        }}
      />
    </div>
  );
}
