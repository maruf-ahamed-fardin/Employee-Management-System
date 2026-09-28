'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Employee } from '@/types/employee';
import type { PaginationMeta } from '@/lib/utils/pagination';

export function useEmployees(params?: {
  search?: string;
  departmentId?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams();
      if (params?.search) q.set('search', params.search);
      if (params?.departmentId) q.set('departmentId', params.departmentId);
      if (params?.status) q.set('status', params.status);
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));

      const res = await fetch(`/api/employees?${q.toString()}`);
      const data = await res.json();
      if (data.success) {
        setEmployees(data.data.items || []);
        if (data.meta) setMeta(data.meta);
      } else {
        setError(data.error || 'Failed to load employees');
      }
    } catch (err: any) {
      setError(err?.message || 'Error fetching employees');
    } finally {
      setIsLoading(false);
    }
  }, [params?.search, params?.departmentId, params?.status, params?.page, params?.limit]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return {
    employees,
    meta,
    isLoading,
    error,
    refetch: fetchEmployees,
  };
}
