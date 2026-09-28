'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Building2, Plus, Users } from 'lucide-react';
import { toast } from 'sonner';

export function DepartmentsClient({ initialDepartments = [] }: { initialDepartments: any[] }) {
  const [departments, setDepartments] = useState<any[]>(initialDepartments);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code, description }),
      });
      const data = await res.json();
      if (data.success) {
        setDepartments([...departments, { ...data.data, _count: { employees: 0 } }]);
        toast.success(`Department "${name}" created`);
        setAddOpen(false);
        setName('');
        setCode('');
        setDescription('');
      } else {
        toast.error(data.error || 'Failed to create department');
      }
    } catch {
      toast.error('Network error creating department');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setAddOpen(true)} size="sm">
          <Plus className="size-4 mr-1" />
          Add Department
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <Card key={dept.id} className="hover:border-indigo-500/30 transition-all">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <Building2 className="size-6" />
                </div>
                <Badge variant="secondary" className="font-mono text-xs">
                  {dept.code}
                </Badge>
              </div>

              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {dept.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {dept.description || 'No division description provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                  <Users className="size-3.5" />
                  {dept._count?.employees || 0} Staff Members
                </span>
                <Badge variant="success" className="text-[10px]">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Department Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Department</DialogTitle>
            <DialogDescription>Define a new organizational department</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Department Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1"
                placeholder="e.g. Design & User Experience"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Department Code *</label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                className="mt-1 font-mono uppercase"
                placeholder="e.g. DUX"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
                placeholder="Short summary of responsibilities"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Department'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
