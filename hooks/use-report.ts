/**
 * Reports hook — revenue/orders/customers series + top products.
 */
import { useCallback } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useStore } from "@/hooks/use-store";
import { useAsync } from "@/hooks/use-async";
import { reportRepository, type ReportFilters } from "@/repositories";
import type { ReportSummary } from "@/types/domain";

export function useReport(filters: ReportFilters = {}) {
  const client = useSupabase();
  const { store } = useStore();
  const storeId = store?.id ?? null;
  const { granularity, from, to } = filters;

  const fetch = useCallback(() => {
    if (!client || !storeId) return Promise.resolve<ReportSummary>({
      series: [], topProducts: [], totals: { revenue: 0, orders: 0, customers: 0, cancelledOrders: 0, conversion: 0 },
    });
    return reportRepository.summary(client, storeId, { granularity, from, to });
  }, [client, storeId, granularity, from, to]);

  const { data: report, loading, error, refetch } = useAsync(fetch, [
    client,
    storeId,
    granularity,
    from,
    to,
  ], Boolean(client && storeId));

  return { report, loading, error, refetch };
}
