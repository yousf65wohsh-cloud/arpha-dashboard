/**
 * API contract types.
 * These define the shape of the HTTP API the dashboard consumes and that a
 * future Flutter client can reuse. V1 serves responses through Next.js route
 * handlers backed by repositories; keep this surface stable.
 */

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface ListResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

/** Query filters for the orders page. */
export interface OrderFilters {
  status?: string | null;
  channel?: string | null;
  search?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
}

/** Query filters for the customers page. */
export interface CustomerFilters {
  search?: string | null;
  status?: string | null;
  city?: string | null;
}
