'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Laptop,
  Monitor,
  Smartphone,
  Headphones,
  Armchair,
  Box,
  Plus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  Clock,
  Wrench,
  Archive,
  ArrowRightLeft,
  RotateCcw,
  Trash2,
  Tag,
  User,
  MapPin,
  Calendar,
  DollarSign,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AddAssetModal } from '@/components/assets/AddAssetModal';
import { AssignAssetModal } from '@/components/assets/AssignAssetModal';
import { toast } from 'sonner';

interface AssetRecord {
  id: string;
  assetTag: string;
  name: string;
  category: string;
  model: string | null;
  serialNumber: string | null;
  purchaseDate: string | null;
  purchaseCost: number;
  currency: string;
  condition: string;
  status: string;
  assignedToId: string | null;
  assignedAt: string | null;
  location: string | null;
  notes: string | null;
  employeeCode?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  departmentName?: string;
}

const CATEGORY_MAP: Record<string, { label: string; icon: any }> = {
  LAPTOP: { label: 'Laptops', icon: Laptop },
  MONITOR: { label: 'Monitors', icon: Monitor },
  MOBILE: { label: 'Mobile / Testing', icon: Smartphone },
  PERIPHERAL: { label: 'Peripherals', icon: Headphones },
  FURNITURE: { label: 'Furniture', icon: Armchair },
  OTHER: { label: 'Other', icon: Box },
};

export function AssetsClient({ employees = [] }: { employees: any[] }) {
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    assigned: 0,
    available: 0,
    maintenance: 0,
    retired: 0,
    valuation: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<AssetRecord | null>(null);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (categoryFilter !== 'ALL') params.set('category', categoryFilter);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/assets?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.data) {
        setAssets(data.data.items || []);
        if (data.data.summary) {
          setSummary(data.data.summary);
        }
      }
    } catch (err) {
      console.error('Failed to load assets', err);
      toast.error('Failed to load asset inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAssets();
  };

  const handleReturnAsset = async (asset: AssetRecord) => {
    if (!confirm(`Check in "${asset.name}" (${asset.assetTag}) back to inventory storage?`)) return;

    try {
      const res = await fetch(`/api/assets/${asset.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RETURN' }),
      });
      if (!res.ok) throw new Error('Failed to return asset');
      toast.success(`${asset.assetTag} checked into storage`);
      fetchAssets();
    } catch (err: any) {
      toast.error(err.message || 'Error returning asset');
    }
  };

  const handleMaintenance = async (asset: AssetRecord) => {
    try {
      const res = await fetch(`/api/assets/${asset.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'MAINTENANCE' }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast.success(`${asset.assetTag} marked under maintenance`);
      fetchAssets();
    } catch (err: any) {
      toast.error(err.message || 'Error updating asset');
    }
  };

  const handleDelete = async (asset: AssetRecord) => {
    if (!confirm(`Are you sure you want to delete ${asset.name} (${asset.assetTag}) permanently?`)) return;

    try {
      const res = await fetch(`/api/assets/${asset.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete asset');
      toast.success('Asset deleted successfully');
      fetchAssets();
    } catch (err: any) {
      toast.error(err.message || 'Error deleting asset');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Hardware & Equipment Hub
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Asset Inventory & Hardware Tracking
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Manage company-issued laptops, displays, mobile testing gear, and office assets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAssets}
            className="border-slate-800 hover:bg-slate-800 text-slate-300 gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setAddModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium gap-2 shadow-lg shadow-indigo-600/25"
          >
            <Plus className="w-4 h-4" />
            Register Asset
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assets & Valuation */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Inventory
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
              <Box className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{summary.total}</span>
            <span className="text-xs text-slate-500">items</span>
          </div>
          <div className="mt-1 text-xs text-indigo-400 font-medium">
            Valuation: {formatCurrency(summary.valuation)}
          </div>
        </div>

        {/* Assigned */}
        <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-900/40 relative overflow-hidden group hover:border-indigo-800/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              Assigned to Staff
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-200">{summary.assigned}</span>
            <span className="text-xs text-indigo-400/80">
              ({summary.total > 0 ? Math.round((summary.assigned / summary.total) * 100) : 0}% in use)
            </span>
          </div>
          <div className="mt-1 text-xs text-indigo-300/70">Actively issued & tracked</div>
        </div>

        {/* Available In Stock */}
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 relative overflow-hidden group hover:border-emerald-800/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Available in Stock
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-200">{summary.available}</span>
            <span className="text-xs text-emerald-400/80">ready to deploy</span>
          </div>
          <div className="mt-1 text-xs text-emerald-400/70">In IT lockers & storage</div>
        </div>

        {/* Maintenance / Repair */}
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-900/40 relative overflow-hidden group hover:border-amber-800/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              In Repair / Service
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-200">{summary.maintenance}</span>
            <span className="text-xs text-amber-400/80">units</span>
          </div>
          <div className="mt-1 text-xs text-amber-400/70">Hardware servicing & upgrades</div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {[
            { id: 'ALL', label: 'All Equipment', count: summary.total },
            { id: 'AVAILABLE', label: 'Available', count: summary.available },
            { id: 'ASSIGNED', label: 'Assigned', count: summary.assigned },
            { id: 'MAINTENANCE', label: 'Maintenance', count: summary.maintenance },
            { id: 'RETIRED', label: 'Retired', count: summary.retired },
          ].map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    active ? 'bg-indigo-800/80 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative min-w-[260px] lg:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder="Search by tag, name, serial, staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 h-9 text-xs bg-slate-950/70 border-slate-800 text-white placeholder:text-slate-500 rounded-xl focus:border-indigo-500"
          />
        </form>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0">
          <Filter className="w-3.5 h-3.5" /> Category:
        </span>
        <button
          onClick={() => setCategoryFilter('ALL')}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            categoryFilter === 'ALL'
              ? 'bg-slate-700 text-white'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          All Categories
        </button>
        {Object.entries(CATEGORY_MAP).map(([key, item]) => {
          const Icon = item.icon;
          const active = categoryFilter === key;
          return (
            <button
              key={key}
              onClick={() => setCategoryFilter(key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                active
                  ? 'bg-indigo-600/20 border border-indigo-500 text-indigo-300'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Inventory Table / Cards */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
            <p className="text-sm">Loading hardware inventory...</p>
          </div>
        ) : assets.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <Box className="w-10 h-10 text-slate-600" />
            <div>
              <p className="text-white font-medium">No assets found</p>
              <p className="text-xs text-slate-500 mt-1">
                Try modifying your search or filter criteria, or register a new asset.
              </p>
            </div>
            <Button
              onClick={() => setAddModalOpen(true)}
              variant="outline"
              size="sm"
              className="mt-2 border-slate-700 text-slate-300"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Register Asset
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase font-semibold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Asset & Model</th>
                  <th className="py-3.5 px-4">Tag & Serial</th>
                  <th className="py-3.5 px-4">Condition</th>
                  <th className="py-3.5 px-4">Current Assignee</th>
                  <th className="py-3.5 px-4">Location / Value</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {assets.map((asset) => {
                  const CategoryIcon = CATEGORY_MAP[asset.category]?.icon || Box;
                  const isAssigned = asset.status === 'ASSIGNED';
                  const isAvailable = asset.status === 'AVAILABLE';
                  const isMaintenance = asset.status === 'MAINTENANCE';

                  return (
                    <tr
                      key={asset.id}
                      className="hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* Asset & Model */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-indigo-400 shrink-0 group-hover:border-indigo-500/40 transition-colors">
                            <CategoryIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-white text-sm">
                              {asset.name}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[220px]">
                              {asset.model || CATEGORY_MAP[asset.category]?.label}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Tag & Serial */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="inline-block font-mono text-[11px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded">
                            {asset.assetTag}
                          </div>
                          {asset.serialNumber && (
                            <div className="text-[10px] font-mono text-slate-500 truncate max-w-[140px]">
                              SN: {asset.serialNumber}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Condition */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            asset.condition === 'NEW'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : asset.condition === 'GOOD'
                              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                              : asset.condition === 'FAIR'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {asset.condition}
                        </span>
                      </td>

                      {/* Current Assignee */}
                      <td className="py-3.5 px-4">
                        {asset.assignedToId && asset.firstName ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-xs shrink-0">
                              {asset.firstName[0]}
                            </div>
                            <div>
                              <div className="font-medium text-white text-xs">
                                {asset.firstName} {asset.lastName}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {asset.employeeCode} • {asset.departmentName || 'Staff'}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic bg-slate-800/40 px-2 py-1 rounded">
                            In Storage (Available)
                          </span>
                        )}
                      </td>

                      {/* Location & Value */}
                      <td className="py-3.5 px-4">
                        <div>
                          <div className="text-white font-medium text-xs">
                            {formatCurrency(asset.purchaseCost || 0)}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate max-w-[120px]">{asset.location || 'Dhaka HQ'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            asset.status === 'AVAILABLE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : asset.status === 'ASSIGNED'
                              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                              : asset.status === 'MAINTENANCE'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              asset.status === 'AVAILABLE'
                                ? 'bg-emerald-400'
                                : asset.status === 'ASSIGNED'
                                ? 'bg-indigo-400'
                                : asset.status === 'MAINTENANCE'
                                ? 'bg-amber-400'
                                : 'bg-slate-500'
                            }`}
                          />
                          {asset.status}
                        </span>
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isAvailable && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedAsset(asset);
                                setAssignModalOpen(true);
                              }}
                              className="h-7 px-2.5 text-xs bg-indigo-600/10 hover:bg-indigo-600/20 border-indigo-500/30 text-indigo-300 font-medium"
                            >
                              Assign
                            </Button>
                          )}

                          {isAssigned && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReturnAsset(asset)}
                              className="h-7 px-2.5 text-xs border-slate-700 hover:bg-slate-800 text-slate-300"
                              title="Check in / return asset back to IT storage"
                            >
                              <RotateCcw className="w-3.5 h-3.5 mr-1 text-slate-400" />
                              Return
                            </Button>
                          )}

                          {!isMaintenance && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMaintenance(asset)}
                              className="h-7 w-7 p-0 text-slate-400 hover:text-amber-300 hover:bg-amber-500/10"
                              title="Mark for repair/maintenance"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(asset)}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                            title="Delete asset"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddAssetModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        employees={employees}
        onSuccess={fetchAssets}
      />

      <AssignAssetModal
        open={assignModalOpen}
        onOpenChange={setAssignModalOpen}
        asset={selectedAsset}
        employees={employees}
        onSuccess={fetchAssets}
      />
    </div>
  );
}
