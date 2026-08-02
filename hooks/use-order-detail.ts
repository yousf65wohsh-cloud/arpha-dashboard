/**
 * Order detail hook — full order with items, customer, and status history.
 */
import { useCallback } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useAsync } from "@/hooks/use-async";
import { orderRepository } from "@/repositories";
import type { OrderDetail } from "@/types/domain";
import type { OrderStatus } from "@/lib/supabase/database.types";

export function useOrderDetail(orderId: string | null) {
  const client = useSupabase();

  const fetch = useCallback(() => {
    if (!client || !orderId) return Promise.resolve<OrderDetail | null>(null);
    return orderRepository.findById(client, orderId);
  }, [client, orderId]);

  const { data: detail, loading, error, refetch, setData } = useAsync<OrderDetail | null>(
    fetch,
    [client, orderId],
    Boolean(client && orderId),
  );

  const updateStatus = useCallback(
    async (nextStatus: OrderStatus, note?: string | null): Promise<OrderDetail | null> => {
      if (!client || !orderId) return null;
      const updated = await orderRepository.updateStatus(client, orderId, nextStatus, note);
      void refetch();
      return updated;
    },
    [client, orderId, refetch],
  );

  return { detail, loading, error, refetch, updateStatus, setDetail: setData };
}
