'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  ChevronDown,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Search,
  ExternalLink,
  Sparkles,
  UserCheck,
  Briefcase,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/format';

export interface OrgEmployee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  photoUrl?: string | null;
  departmentId: string;
  departmentName: string;
  positionTitle: string;
  managerId?: string | null;
  workLocation?: string;
}

interface TreeNode extends OrgEmployee {
  children: TreeNode[];
}

const DEPT_COLORS: Record<string, { bg: string; text: string; border: string; bar: string }> = {
  'Engineering & Technology': {
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-500/30',
    bar: 'bg-indigo-500',
  },
  'Product & Design': {
    bg: 'bg-purple-500/10 dark:bg-purple-500/15',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/30',
    bar: 'bg-purple-500',
  },
  'Human Resources': {
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/30',
    bar: 'bg-rose-500',
  },
  'Finance & Operations': {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    bar: 'bg-emerald-500',
  },
  'Sales & Business Development': {
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30',
    bar: 'bg-amber-500',
  },
  Marketing: {
    bg: 'bg-[#f37021]/10 dark:bg-[#f37021]/15',
    text: 'text-[#f37021] dark:text-[#fb923c]',
    border: 'border-[#f37021]/30',
    bar: 'bg-[#f37021]',
  },
};

function getDeptStyle(name: string) {
  return (
    DEPT_COLORS[name] || {
      bg: 'bg-slate-500/10 dark:bg-slate-500/15',
      text: 'text-slate-600 dark:text-slate-400',
      border: 'border-slate-500/30',
      bar: 'bg-slate-500',
    }
  );
}

function getInitials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

export function OrgChartClient({ employees }: { employees: OrgEmployee[] }) {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [zoom, setZoom] = useState(1);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  // Distinct departments
  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => {
      if (e.departmentName) set.add(e.departmentName);
    });
    return Array.from(set);
  }, [employees]);

  // Build tree from flat list
  const { roots, totalDirectsMap } = useMemo(() => {
    const map = new Map<string, TreeNode>();
    const countMap = new Map<string, number>();

    employees.forEach((emp) => {
      map.set(emp.id, { ...emp, children: [] });
    });

    const rootNodes: TreeNode[] = [];

    employees.forEach((emp) => {
      const node = map.get(emp.id)!;
      if (emp.managerId && map.has(emp.managerId)) {
        const managerNode = map.get(emp.managerId)!;
        managerNode.children.push(node);
        countMap.set(emp.managerId, (countMap.get(emp.managerId) || 0) + 1);
      } else {
        rootNodes.push(node);
      }
    });

    return { roots: rootNodes, totalDirectsMap: countMap };
  }, [employees]);

  const toggleCollapse = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setCollapsedIds(new Set());
  const collapseAll = () => {
    const allManagerIds = new Set<string>();
    employees.forEach((e) => {
      if (totalDirectsMap.has(e.id)) allManagerIds.add(e.id);
    });
    setCollapsedIds(allManagerIds);
  };

  // Node Component
  const renderNode = (node: TreeNode, level = 0): React.ReactNode => {
    const isCollapsed = collapsedIds.has(node.id);
    const hasChildren = node.children.length > 0;
    const directCount = totalDirectsMap.get(node.id) || 0;
    const deptStyle = getDeptStyle(node.departmentName);

    const matchesSearch =
      search.trim() !== '' &&
      (`${node.firstName} ${node.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        node.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
        node.positionTitle.toLowerCase().includes(search.toLowerCase()));

    const isDimmed =
      (selectedDept !== 'ALL' && node.departmentName !== selectedDept) ||
      (search.trim() !== '' && !matchesSearch);

    return (
      <div key={node.id} className="flex flex-col items-center">
        {/* The Card */}
        <div
          className={cn(
            'group relative w-72 rounded-2xl border bg-card/90 backdrop-blur-xl p-4 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 select-none',
            deptStyle.border,
            matchesSearch && 'ring-2 ring-[#f37021] scale-105 shadow-xl',
            isDimmed && 'opacity-40 hover:opacity-100'
          )}
        >
          {/* Top color indicator bar */}
          <div className={cn('absolute top-0 left-4 right-4 h-1 rounded-full', deptStyle.bar)} />

          <div className="flex items-start gap-3 pt-1">
            <div className="relative">
              <Avatar className="size-12 ring-2 ring-card shadow-sm bg-muted shrink-0">
                {node.photoUrl && (
                  <AvatarImage
                    src={node.photoUrl}
                    alt={`${node.firstName} ${node.lastName}`}
                  />
                )}
                <AvatarFallback className="bg-primary/15 text-primary font-bold text-sm">
                  {getInitials(node.firstName, node.lastName)}
                </AvatarFallback>
              </Avatar>
              {level === 0 && (
                <span
                  title="Leadership Executive"
                  className="absolute -top-1 -right-1 size-4 rounded-full bg-[#f37021] ring-2 ring-card flex items-center justify-center text-[9px] text-white font-bold"
                >
                  ★
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <Link
                  href={`/team-profile/${node.id}`}
                  className="font-bold text-sm text-foreground hover:text-primary transition-colors truncate"
                >
                  {node.firstName} {node.lastName}
                </Link>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted/80 text-muted-foreground shrink-0">
                  {node.employeeCode}
                </span>
              </div>

              <p className="text-xs font-medium text-muted-foreground truncate mt-0.5">
                {node.positionTitle}
              </p>

              <div className="mt-2.5 flex items-center justify-between gap-1.5">
                <span
                  className={cn(
                    'text-[10px] font-semibold px-2 py-0.5 rounded-full border truncate',
                    deptStyle.bg,
                    deptStyle.text,
                    deptStyle.border
                  )}
                >
                  {node.departmentName}
                </span>

                <Link
                  href={`/team-profile/${node.id}`}
                  title="View Profile Card"
                  className="size-6 rounded-lg bg-muted/60 hover:bg-primary hover:text-white flex items-center justify-center text-muted-foreground transition-all shrink-0"
                >
                  <ExternalLink className="size-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Expand / Collapse Direct Reports Trigger Button */}
          {hasChildren && (
            <button
              type="button"
              onClick={() => toggleCollapse(node.id)}
              className={cn(
                'absolute -bottom-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-md ring-1 transition-all cursor-pointer z-20',
                isCollapsed
                  ? 'bg-[#f37021] text-white ring-[#f37021]/50 hover:bg-[#dc5e10]'
                  : 'bg-card text-foreground ring-border hover:bg-accent'
              )}
            >
              <span>{directCount} Direct</span>
              {isCollapsed ? (
                <ChevronRight className="size-3" />
              ) : (
                <ChevronDown className="size-3" />
              )}
            </button>
          )}
        </div>

        {/* Tree Connectors & Children */}
        {hasChildren && !isCollapsed && (
          <div className="relative pt-6 flex flex-col items-center">
            {/* Vertical line descending from parent */}
            <div className="w-[2px] h-6 bg-border absolute top-0 left-1/2 -translate-x-1/2" />

            {/* Horizontal branch bar if multiple children */}
            {node.children.length > 1 && (
              <div
                className="h-[2px] bg-border absolute top-6"
                style={{
                  left: `calc(${100 / (node.children.length * 2)}%)`,
                  right: `calc(${100 / (node.children.length * 2)}%)`,
                }}
              />
            )}

            {/* Children container */}
            <div className="flex gap-8 items-start relative">
              {node.children.map((child) => (
                <div key={child.id} className="relative flex flex-col items-center">
                  {/* Vertical connector to each child */}
                  <div className="w-[2px] h-6 bg-border absolute -top-0 left-1/2 -translate-x-1/2" />
                  <div className="pt-6">{renderNode(child, level + 1)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Filters Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Organization Chart
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary">
              <Layers className="size-3 text-[#f37021]" />
              <span>{employees.length} Members</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Visual corporate hierarchy mapping reporting relationships, leadership levels, and team distribution.
          </p>
        </div>

        {/* Toolbar & Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search member or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 rounded-xl border border-input bg-card pl-9 pr-3 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="h-9 rounded-xl border border-input bg-card px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Zoom & Expand Controls */}
          <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-0.5 shadow-xs">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
              title="Zoom Out"
              className="size-8 rounded-lg"
            >
              <ZoomOut className="size-3.5" />
            </Button>
            <span className="font-mono text-[11px] font-bold px-1.5 text-muted-foreground">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
              title="Zoom In"
              className="size-8 rounded-lg"
            >
              <ZoomIn className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setZoom(1)}
              title="Reset Zoom"
              className="size-8 rounded-lg"
            >
              <Maximize2 className="size-3.5" />
            </Button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={collapsedIds.size > 0 ? expandAll : collapseAll}
            className="h-9 rounded-xl text-xs font-semibold"
          >
            {collapsedIds.size > 0 ? 'Expand All' : 'Collapse All'}
          </Button>
        </div>
      </div>

      {/* Interactive Infinite Canvas Container */}
      <div className="relative rounded-2xl border border-border bg-card/40 backdrop-blur-md overflow-x-auto overflow-y-hidden p-8 sm:p-12 shadow-inner min-h-[560px] flex items-start justify-center">
        {/* Background Grid Accent */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-15 [background-image:radial-gradient(rgba(100,116,139,0.5)_1px,transparent_1px)] [background-size:20px_20px]"
        />

        <div
          className="transition-transform duration-200 origin-top flex flex-col items-center gap-12"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Executive Leadership Root Row */}
          <div className="flex flex-wrap items-start justify-center gap-16">
            {roots.map((rootNode) => renderNode(rootNode, 0))}
          </div>

          {roots.length === 0 && (
            <div className="text-center py-20">
              <Users className="size-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-bold text-foreground">No employees found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add employees to the system to visualize your organization structure.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
