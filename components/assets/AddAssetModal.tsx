'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Laptop, Monitor, Smartphone, Headphones, Armchair, Box, Tag, DollarSign, MapPin, User, FileText } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'LAPTOP', label: 'Laptop / Workstation', icon: Laptop },
  { value: 'MONITOR', label: 'Display / Monitor', icon: Monitor },
  { value: 'MOBILE', label: 'Mobile / Testing Device', icon: Smartphone },
  { value: 'PERIPHERAL', label: 'Keyboard / Peripheral', icon: Headphones },
  { value: 'FURNITURE', label: 'Office Furniture', icon: Armchair },
  { value: 'OTHER', label: 'Other Equipment', icon: Box },
];

const CONDITIONS = [
  { value: 'NEW', label: 'Brand New (Mint)' },
  { value: 'GOOD', label: 'Good (Minor wear)' },
  { value: 'FAIR', label: 'Fair (Functional)' },
  { value: 'DAMAGED', label: 'Damaged / Needs Repair' },
];

export function AddAssetModal({
  open,
  onOpenChange,
  employees = [],
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: any[];
  onSuccess?: () => void;
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('LAPTOP');
  const [assetTag, setAssetTag] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [condition, setCondition] = useState('GOOD');
  const [assignedToId, setAssignedToId] = useState('');
  const [location, setLocation] = useState('HQ - Dhaka Office');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setCategory('LAPTOP');
    setAssetTag('');
    setModel('');
    setSerialNumber('');
    setPurchaseCost('');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setCondition('GOOD');
    setAssignedToId('');
    setLocation('HQ - Dhaka Office');
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Asset name is required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category,
          assetTag: assetTag.trim() || undefined,
          model: model.trim() || undefined,
          serialNumber: serialNumber.trim() || undefined,
          purchaseCost: purchaseCost ? Number(purchaseCost) : 0,
          purchaseDate,
          condition,
          assignedToId: assignedToId || null,
          status: assignedToId ? 'ASSIGNED' : 'AVAILABLE',
          location: location.trim(),
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.error || 'Failed to register asset');
      }

      toast.success('Asset successfully registered to inventory');
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || 'Error creating asset');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800 text-slate-100">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">Register Hardware Asset</DialogTitle>
              <DialogDescription className="text-slate-400 text-sm">
                Add corporate devices, workstations, and equipment to the company inventory.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Asset Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all text-left ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 shadow-sm shadow-indigo-500/10'
                        : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Asset Name & Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Asset Name <span className="text-red-400">*</span>
              </label>
              <Input
                placeholder="e.g. MacBook Pro 16'' M3 Max"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Asset Tag / Code (Optional)
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input
                  placeholder="Auto-generated if blank (e.g. AST-LPT-009)"
                  value={assetTag}
                  onChange={(e) => setAssetTag(e.target.value)}
                  className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 pl-9 font-mono text-xs focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Model Specification & Serial Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Model / Specification
              </label>
              <Input
                placeholder="e.g. Apple Silicon 36GB / 1TB SSD"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Serial Number
              </label>
              <Input
                placeholder="e.g. C02G9988MD6T"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 font-mono text-xs focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Purchase Cost & Purchase Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Purchase Cost (BDT)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  ৳
                </span>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  placeholder="e.g. 275000"
                  value={purchaseCost}
                  onChange={(e) => setPurchaseCost(e.target.value)}
                  className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 pl-8 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Purchase Date
              </label>
              <Input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="bg-slate-950/60 border-slate-800 text-white focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Condition & Storage Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Physical Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-slate-950/60 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Storage / Office Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input
                  placeholder="e.g. Dhaka HQ - IT Storage"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 pl-9 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Assignment Dropdown */}
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800/80">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Assign to Employee (Optional)
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Leave unassigned if this hardware is kept in storage/inventory for future deployment.
            </p>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="">Keep in IT Stock (Available)</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeCode}) — {emp.department?.name || 'Staff'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Handover Remarks / Accessories Included
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Includes original 140W charger, USB-C cable, and laptop case."
              className="w-full p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25"
            >
              {submitting ? 'Registering...' : 'Register Asset'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
