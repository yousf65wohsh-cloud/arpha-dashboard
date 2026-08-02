/**
 * Orders hooks — list (with filters), status counts, status transitions.
 */
import { useCallback } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useStore } from "@/hooks/use-store";
import { useAsync } from "@/hooks/use-async";
import { orderRepository } from "@/repositories";
import type { OrderFilters } from "@/types/api";
import type { OrderDetail } from "@/types/domain";
import type { OrderStatus } from "@/lib/supabase/database.types";

export function useOrders(filters: OrderFilters = {}) {
  const client = useSupabase();
  const { store } = useStore();
  const storeId = store?.id ?? null;
  const { status, channel, dateFrom, dateTo, search } = filters;

  const fetch = useCallback(() => {
    if (!client || !storeId) return Promise.resolve([]);
    return orderRepository.list(client, storeId, { status, channel, dateFrom, dateTo, search });
  }, [client, storeId, status, channel, dateFrom, dateTo, search]);

  const { data: orders, loading, error, refetch, setData } = useAsync(fetch, [
    client,
    storeId,
    status,
    channel,
    dateFrom,
    dateTo,
    search,
  ], Boolean(client && storeId));

  const updateStatus = useCallback(
    async (orderId: string, nextStatus: OrderStatus, note?: string | null): Promise<OrderDetail | null> => {
      if (!client) return null;
      const detail = await orderRepository.updateStatus(client, orderId, nextStatus, note);
      void refetch();
      return detail;
    },
    [client, refetch],
  );

  return { orders, loading, error, refetch, setOrders: setData, updateStatus };
}

export function useOrderStatusCounts() {
  const client = useSupabase();
  const { store } = useStore();
  const storeId = store?.id ?? null;

  const fetch = useCallback(() => {
    if (!client || !storeId) return Promise.resolve<Record<OrderStatus, number>>({
      pending: 0, confirmed: 0, rejected: 0, delivered: 0, cancelled: 0,
    });
    return orderRepository.statusCounts(client, storeId);
  }, [client, storeId]);

  const { data: counts, loading, error, refetch } = useAsync(fetch, [client, storeId], Boolean(client && storeId));

  return {
    counts: counts ?? { pending: 0, confirmed: 0, rejected: 0, delivered: 0, cancelled: 0 },
    loading,
    error,
    refetch,
  };
}

export interface OverviewCounts {
  today: number;
  pending: number;
  revenue: number;
}

export function useOverviewCounts() {
  const client = useSupabase();
  const { store } = useStore();
  const storeId = store?.id ?? null;

  const fetch = useCallback(() => {
    if (!client || !storeId) return Promise.resolve<OverviewCounts>({ today: 0, pending: 0, revenue: 0 });
    return orderRepository.overviewCounts(client, storeId);
  }, [client, storeId]);

  const { data: counts, loading, error, refetch } = useAsync(fetch, [client, storeId], Boolean(client && storeId));

  return {
    counts: counts ?? { today: 0, pending: 0, revenue: 0 },
    loading,
    error,
    refetch,
  };
}
