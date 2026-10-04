'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Shield, UserPlus, KeyRound, Power, PowerOff, Search, Loader2, UserCog, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { confirmDialog } from '@/components/ui/confirm';

export interface UserItem {
  id: string;
  email: string;
  role: string;
  roleId?: string | null;
  status: string;
  lastLoginAt?: string | Date | null;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
    email?: string;
    department?: { id: string; name: string } | null;
  } | null;
  roleRef?: {
    id: string;
    name: string;
    description?: string | null;
  } | null;
}

export interface RoleOption {
  id: string;
  name: string;
  description?: string | null;
}

export interface EmployeeOption {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  email: string;
}

interface Props {
  initialUsers: UserItem[];
  roles: RoleOption[];
  unlinkedEmployees: EmployeeOption[];
}

export function UserManagementClient({ initialUsers, roles, unlinkedEmployees }: Props) {
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Dialog States
  const [createOpen, setCreateOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // Form States
  const [createEmployeeId, setCreateEmployeeId] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRoleId, setCreateRoleId] = useState(roles[0]?.id || '');
  const [newRoleId, setNewRoleId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle employee select in create dialog
  const handleEmployeeChange = (empId: string) => {
    setCreateEmployeeId(empId);
    const emp = unlinkedEmployees.find((e) => e.id === empId);
    if (emp && emp.email) {
      setCreateEmail(emp.email);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createEmail || !createPassword) {
      toast.error('Email and password are required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: createEmployeeId || undefined,
          email: createEmail,
          password: createPassword,
          roleId: createRoleId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');

      toast.success('User account created successfully');
      setCreateOpen(false);
      setCreateEmail('');
      setCreatePassword('');
      setCreateEmployeeId('');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error creating user');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newRoleId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId: newRoleId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update role');

      toast.success('User role updated');
      setRoleDialogOpen(false);
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, role: data.data.role, roleId: newRoleId } : u))
      );
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error updating role');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user: UserItem) => {
    const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const confirmed = await confirmDialog(
      nextStatus === 'INACTIVE'
        ? {
            title: 'Deactivate this account?',
            description: `${user.email} will no longer be able to log in.`,
            confirmLabel: 'Deactivate',
            tone: 'danger',
          }
        : {
            title: 'Reactivate this account?',
            description: `${user.email} will be able to log in again.`,
            confirmLabel: 'Reactivate',
          }
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      toast.success(`User marked as ${nextStatus}`);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
      );
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error updating status');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newPassword) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');

      toast.success(`Password reset for ${selectedUser.email}`);
      setResetDialogOpen(false);
      setNewPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.employee &&
        `${u.employee.firstName} ${u.employee.lastName} ${u.employee.employeeCode}`
          .toLowerCase()
          .includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (roleFilter && u.role.toLowerCase() !== roleFilter.toLowerCase()) return false;
    if (statusFilter && u.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search user email or staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-[#252175]"
          >
            <option value="">All Roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-[#252175]"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        {/* Create User Button */}
        <Button
          onClick={() => {
            setCreateRoleId(roles[0]?.id || '');
            setCreateOpen(true);
          }}
          className="bg-[#252175] hover:bg-[#1d1a5c] text-white gap-2 font-medium shrink-0"
        >
          <UserPlus className="size-4 text-[#F37021]" />
          Create User Account
        </Button>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="font-semibold">User Account</TableHead>
              <TableHead className="font-semibold">Assigned Role</TableHead>
              <TableHead className="font-semibold">Linked Staff Member</TableHead>
              <TableHead className="font-semibold">Department</TableHead>
              <TableHead className="font-semibold">Account Status</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No user accounts found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u) => {
                const initials = u.employee
                  ? `${u.employee.firstName[0]}${u.employee.lastName[0]}`
                  : u.email.substring(0, 2).toUpperCase();

                return (
                  <TableRow key={u.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar initials={initials} size="sm" />
                        <div>
                          <p className="font-semibold text-foreground text-sm">{u.email}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">ID: {u.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          u.role === 'SUPER_ADMIN' || u.role === 'superadmin'
                            ? 'destructive'
                            : u.role === 'ADMIN' || u.role === 'admin'
                            ? 'default'
                            : 'secondary'
                        }
                        className="font-bold text-xs gap-1"
                      >
                        <Shield className="size-3 text-[#F37021]" />
                        {u.roleRef?.name || u.role}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {u.employee ? (
                        <div>
                          <p className="font-medium text-sm text-foreground">
                            {u.employee.firstName} {u.employee.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {u.employee.employeeCode}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Unlinked Account</span>
                      )}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {u.employee?.department?.name || '—'}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={u.status === 'ACTIVE' ? 'outline' : 'secondary'}
                        className={
                          u.status === 'ACTIVE'
                            ? 'text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30'
                            : 'text-slate-500'
                        }
                      >
                        {u.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Change Role Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-[#252175] dark:text-[#F37021] hover:bg-[#252175]/10"
                          title="Change Role"
                          onClick={() => {
                            setSelectedUser(u);
                            setNewRoleId(u.roleId || roles[0]?.id || '');
                            setRoleDialogOpen(true);
                          }}
                        >
                          <UserCog className="size-4" />
                        </Button>

                        {/* Reset Password Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-[#252175] dark:text-[#F37021] hover:bg-[#252175]/10"
                          title="Reset Password"
                          onClick={() => {
                            setSelectedUser(u);
                            setNewPassword('');
                            setResetDialogOpen(true);
                          }}
                        >
                          <KeyRound className="size-4" />
                        </Button>

                        {/* Toggle Active / Inactive */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`size-8 ${
                            u.status === 'ACTIVE'
                              ? 'text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-950/30'
                              : 'text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950/30'
                          }`}
                          title={u.status === 'ACTIVE' ? 'Deactivate Account' : 'Reactivate Account'}
                          onClick={() => handleToggleStatus(u)}
                        >
                          {u.status === 'ACTIVE' ? (
                            <PowerOff className="size-4" />
                          ) : (
                            <Power className="size-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* 1. Create User Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateUser}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[#252175] dark:text-white flex items-center gap-2">
                <UserPlus className="size-5 text-[#F37021]" />
                Create User Login
              </DialogTitle>
              <DialogDescription>
                Grant system portal access to an employee or register an administrative operator.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Link to Employee (Optional)
                </Label>
                <select
                  className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#252175]"
                  value={createEmployeeId}
                  onChange={(e) => handleEmployeeChange(e.target.value)}
                >
                  <option value="">No employee link (Standalone Admin)</option>
                  {unlinkedEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Login Email
                </Label>
                <Input
                  type="email"
                  placeholder="user@selorax.com"
                  className="mt-1.5"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Initial Password
                </Label>
                <Input
                  type="password"
                  placeholder="Minimum 8 characters"
                  className="mt-1.5"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Role & Permissions
                </Label>
                <select
                  className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#252175]"
                  value={createRoleId}
                  onChange={(e) => setCreateRoleId(e.target.value)}
                  required
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} - {r.description || 'System Role'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#252175] hover:bg-[#1d1a5c] text-white"
              >
                {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
                Create User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Change Role Modal */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleChangeRole}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[#252175] dark:text-white flex items-center gap-2">
                <UserCog className="size-5 text-[#F37021]" />
                Change User Role
              </DialogTitle>
              <DialogDescription>
                Update permission scope and access privileges for {selectedUser?.email}.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Select New Role
              </Label>
              <select
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#252175]"
                value={newRoleId}
                onChange={(e) => setNewRoleId(e.target.value)}
                required
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.description ? `(${r.description})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setRoleDialogOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#252175] hover:bg-[#1d1a5c] text-white"
              >
                {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
                Save Role
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. Reset Password Modal */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleResetPassword}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[#252175] dark:text-white flex items-center gap-2">
                <KeyRound className="size-5 text-[#F37021]" />
                Reset User Password
              </DialogTitle>
              <DialogDescription>
                Assign a new login password for {selectedUser?.email}.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                New Password
              </Label>
              <Input
                type="password"
                placeholder="Enter new strong password"
                className="mt-1.5"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setResetDialogOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#252175] hover:bg-[#1d1a5c] text-white"
              >
                {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
                Confirm Reset
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
