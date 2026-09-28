import { NextResponse } from 'next/server';
import type { ApiResponse, PaginationParams } from '@/types/api';

export function successResponse<T>(data: T, message?: string, meta?: ApiResponse['meta'], status = 200) {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    meta,
  };
  return NextResponse.json(response, { status });
}

export function errorResponse(error: string, status = 400) {
  const response: ApiResponse = {
    success: false,
    error,
  };
  return NextResponse.json(response, { status });
}

export function parsePagination(searchParams: URLSearchParams): Required<PaginationParams> {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc';

  return { page, limit, search, sortBy, sortOrder };
}
