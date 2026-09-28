import { create } from 'zustand';
import type { Employee } from '@/types/employee';

interface EmployeeState {
  selectedEmployee: Employee | null;
  searchQuery: string;
  departmentFilter: string;
  statusFilter: string;
  viewMode: 'grid' | 'table';
  setSelectedEmployee: (emp: Employee | null) => void;
  setSearchQuery: (q: string) => void;
  setDepartmentFilter: (depId: string) => void;
  setStatusFilter: (status: string) => void;
  setViewMode: (mode: 'grid' | 'table') => void;
}

export const useEmployeeStore = create<EmployeeState>((set) => ({
  selectedEmployee: null,
  searchQuery: '',
  departmentFilter: '',
  statusFilter: '',
  viewMode: 'grid',
  setSelectedEmployee: (selectedEmployee) => set({ selectedEmployee }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setDepartmentFilter: (departmentFilter) => set({ departmentFilter }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setViewMode: (viewMode) => set({ viewMode }),
}));
