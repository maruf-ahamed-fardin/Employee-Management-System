'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface DepartmentOption {
  id: string;
  name: string;
}

interface PositionOption {
  id: string;
  title: string;
  departmentId?: string | null;
}

interface ManagerOption {
  id: string;
  firstName: string;
  lastName: string;
}

export function EmployeeForm({
  initialData,
  departments = [],
  positions = [],
  managers = [],
  isEdit = false,
}: {
  initialData?: any;
  departments: DepartmentOption[];
  positions: PositionOption[];
  managers: ManagerOption[];
  isEdit?: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Address and emergency contact parsing if edit
  let parsedAddress = { line1: '', city: 'Dhaka', postcode: '', country: 'Bangladesh' };
  let parsedEmergency = { name: '', relationship: '', phone: '' };

  if (initialData?.address) {
    try {
      parsedAddress = typeof initialData.address === 'string' ? JSON.parse(initialData.address) : initialData.address;
    } catch {}
  }

  if (initialData?.emergencyContact) {
    try {
      parsedEmergency = typeof initialData.emergencyContact === 'string' ? JSON.parse(initialData.emergencyContact) : initialData.emergencyContact;
    } catch {}
  }

  const [formData, setFormData] = useState({
    employeeCode: initialData?.employeeCode || `SX-${Math.floor(100 + Math.random() * 900)}`,
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    businessPhone: initialData?.businessPhone || '',
    dateOfBirth: initialData?.dateOfBirth || '1998-05-15',
    gender: initialData?.gender || 'MALE',
    bloodGroup: initialData?.bloodGroup || 'B+',
    headline: initialData?.headline || '',
    departmentId: initialData?.departmentId || (departments[0]?.id || ''),
    positionId: initialData?.positionId || (positions[0]?.id || ''),
    managerId: initialData?.managerId || '',
    joiningDate: initialData?.joiningDate || new Date().toISOString().slice(0, 10),
    employmentType: initialData?.employmentType || 'FULL_TIME',
    status: initialData?.status || 'ACTIVE',
    workLocation: initialData?.workLocation || 'Dhaka HQ, Bangladesh',
    salary: initialData?.salary || 65000,
    addressLine1: parsedAddress.line1 || '124 Bir Uttam Mir Shawkat Sarak',
    addressCity: parsedAddress.city || 'Dhaka',
    addressCountry: parsedAddress.country || 'Bangladesh',
    emergencyName: parsedEmergency.name || 'Emergency Contact',
    emergencyRelation: parsedEmergency.relationship || 'Spouse',
    emergencyPhone: parsedEmergency.phone || '+8801700000000',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      employeeCode: formData.employeeCode,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      businessPhone: formData.businessPhone || null,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      headline: formData.headline || null,
      departmentId: formData.departmentId,
      positionId: formData.positionId,
      managerId: formData.managerId || null,
      joiningDate: formData.joiningDate,
      employmentType: formData.employmentType,
      status: formData.status,
      workLocation: formData.workLocation,
      salary: Number(formData.salary),
      address: {
        line1: formData.addressLine1,
        city: formData.addressCity,
        country: formData.addressCountry,
      },
      emergencyContact: {
        name: formData.emergencyName,
        relationship: formData.emergencyRelation,
        phone: formData.emergencyPhone,
      },
    };

    try {
      const url = isEdit ? `/api/employees/${initialData.id}` : '/api/employees';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        toast.success(isEdit ? 'Employee updated successfully!' : 'Employee created successfully!');
        router.push(isEdit ? `/employees/${initialData.id}` : '/employees');
        router.refresh();
      } else {
        toast.error(result.error || 'Validation error');
      }
    } catch {
      toast.error('Failed to submit employee form');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Basic & Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Core identity and demographic data</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Employee Code *</label>
            <Input
              name="employeeCode"
              value={formData.employeeCode}
              onChange={handleChange}
              required
              className="mt-1 font-mono uppercase"
              placeholder="SX-001"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">First Name *</label>
            <Input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="mt-1"
              placeholder="e.g. Ashek"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Last Name *</label>
            <Input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="mt-1"
              placeholder="e.g. Rabbani"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Date of Birth *</label>
            <Input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Blood Group</label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 2. Employment & Organization */}
      <Card>
        <CardHeader>
          <CardTitle>Organization & Job Profile</CardTitle>
          <CardDescription>Department, role, manager, and compensation</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Department *</label>
            <select
              name="departmentId"
              value={formData.departmentId}
              onChange={handleChange}
              required
              className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Position / Title *</label>
            <select
              name="positionId"
              value={formData.positionId}
              onChange={handleChange}
              required
              className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Reporting Manager</label>
            <select
              name="managerId"
              value={formData.managerId}
              onChange={handleChange}
              className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">None (Self / Executive)</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.firstName} {m.lastName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Joining Date *</label>
            <Input
              type="date"
              name="joiningDate"
              value={formData.joiningDate}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Employment Type</label>
            <select
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERN">Intern</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Base Salary ($) *</label>
            <Input
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Work Location</label>
            <Input
              name="workLocation"
              value={formData.workLocation}
              onChange={handleChange}
              className="mt-1"
              placeholder="e.g. Dhaka HQ, Bangladesh"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="ACTIVE">Active</option>
              <option value="PROBATION">Probation</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 3. Contact & Digital Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Contact & Digital Card Details</CardTitle>
          <CardDescription>Public directory, phone, address, and headline</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Work Email *</label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1"
              placeholder="name@selorax.test"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Personal Phone *</label>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="mt-1"
              placeholder="+8801711204318"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Business / Direct Phone</label>
            <Input
              name="businessPhone"
              value={formData.businessPhone}
              onChange={handleChange}
              className="mt-1"
              placeholder="+88029876543"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Digital Card Headline</label>
            <Input
              name="headline"
              value={formData.headline}
              onChange={handleChange}
              maxLength={120}
              className="mt-1"
              placeholder="e.g. Building next-gen software & design systems"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Street Address</label>
            <Input
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
              className="mt-1"
              placeholder="Street address"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Emergency Contact Name</label>
            <Input
              name="emergencyName"
              value={formData.emergencyName}
              onChange={handleChange}
              className="mt-1"
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Emergency Contact Phone</label>
            <Input
              name="emergencyPhone"
              value={formData.emergencyPhone}
              onChange={handleChange}
              className="mt-1"
              placeholder="+8801900000000"
            />
          </div>
        </CardContent>
      </Card>

      {/* Submission Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting} className="min-w-32">
          {submitting ? 'Saving...' : isEdit ? 'Update Employee' : 'Create Employee'}
        </Button>
      </div>
    </form>
  );
}
