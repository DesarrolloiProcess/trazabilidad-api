import type { PaginationQuery } from '#src/shared/schema/pagination.schema.js';

export interface PagedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function toPagedResult<T>(data: T[], total: number, pagination: PaginationQuery): PagedResult<T> {
  return {
    data,
    meta: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / pagination.limit)),
    },
  };
}

export function toOffset(pagination: PaginationQuery): number {
  return (pagination.page - 1) * pagination.limit;
}
