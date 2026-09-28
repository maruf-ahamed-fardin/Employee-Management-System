'use client';

import React, { useState, useMemo } from 'react';
import { Search, Users, Building2, MapPin, X, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProfileCardTile, TeamProfilePerson } from './ProfileCardTile';
import { ScanDialog } from './ScanDialog';

interface DepartmentItem {
  id: string;
  name: string;
  code: string;
}

export function TeamProfileDirectory({
  initialPeople,
  departments,
}: {
  initialPeople: TeamProfilePerson[];
  departments: DepartmentItem[];
}) {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');

  // Unique locations from data
  const locations = useMemo(() => {
    const set = new Set<string>();
    initialPeople.forEach((p) => {
      if (p.workLocation) set.add(p.workLocation);
    });
    return Array.from(set);
  }, [initialPeople]);

  const filtered = useMemo(() => {
    return initialPeople.filter((p) => {
      // Dept filter
      if (selectedDept !== 'ALL' && p.department !== selectedDept) {
        return false;
      }
      // Location filter
      if (selectedLocation !== 'ALL' && p.workLocation !== selectedLocation) {
        return false;
      }
      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = p.fullName.toLowerCase().includes(q);
        const matchCode = p.employeeCode.toLowerCase().includes(q);
        const matchEmail = p.email.toLowerCase().includes(q);
        const matchPos = p.position.toLowerCase().includes(q);
        const matchHeadline = p.headline?.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchEmail && !matchPos && !matchHeadline) {
          return false;
        }
      }
      return true;
    });
  }, [initialPeople, search, selectedDept, selectedLocation]);

  const hasFilters = search.trim() !== '' || selectedDept !== 'ALL' || selectedLocation !== 'ALL';

  const resetFilters = () => {
    setSearch('');
    setSelectedDept('ALL');
    setSelectedLocation('ALL');
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar & Filters */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by colleague name, ID (SX-001), job title, or email..."
              className="pl-9 pr-8 h-10.5 text-sm bg-background border-border/90"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ScanDialog />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/60">
          <span className="text-xs font-semibold text-muted-foreground mr-1">Department:</span>
          <button
            onClick={() => setSelectedDept('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selectedDept === 'ALL'
                ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                : 'bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            All Teams ({initialPeople.length})
          </button>
          {departments.map((d) => {
            const count = initialPeople.filter((p) => p.department === d.name).length;
            if (count === 0) return null;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDept(d.name)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedDept === d.name
                    ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                    : 'bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                {d.name} ({count})
              </button>
            );
          })}

          {locations.length > 1 && (
            <div className="flex items-center gap-1.5 ml-auto">
              <MapPin className="size-3.5 text-muted-foreground" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="text-xs bg-secondary/80 border border-border/60 rounded-lg px-2.5 py-1 text-foreground focus:outline-none"
              >
                <option value="ALL">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          )}

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Directory Count Bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-primary" />
          <span className="font-medium text-foreground">
            {filtered.length} {filtered.length === 1 ? 'colleague' : 'colleagues'}
          </span>
          {hasFilters && <span>(matching current filters)</span>}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Sparkles className="size-3 text-[#F37021]" />
          <span>Interactive Digital Cards with NFC & vCard export</span>
        </div>
      </div>

      {/* Grid of Profiles */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 p-12 text-center bg-card">
          <div className="mx-auto size-14 rounded-full bg-accent/60 flex items-center justify-center text-primary mb-3">
            <Users className="size-7 text-muted-foreground" />
          </div>
          <h3 className="text-base font-bold text-foreground">No team members match that</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords, clear active department filters, or look up by employee ID (e.g. SX-001).
          </p>
          <Button variant="outline" size="sm" onClick={resetFilters} className="mt-4 text-xs font-semibold">
            Reset All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((person) => (
            <ProfileCardTile key={person.employeeId} person={person} />
          ))}
        </div>
      )}
    </div>
  );
}
