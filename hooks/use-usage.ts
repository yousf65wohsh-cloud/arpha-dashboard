/**
 * AI usage hooks — summary card + monthly chart data.
 */
import { useCallback } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useStore } from "@/hooks/use-store";
import { useAsync } from "@/hooks/use-async";
import { usageRepository } from "@/repositories";
import type { UsageSummary } from "@/types/domain";

export function useUsageSummary() {
  const client = useSupabase();
  const { store } = useStore();
  const storeId = store?.id ?? null;

  const fetch = useCallback(() => {
    if (!client || !storeId) return Promise.resolve<UsageSummary>({
      messages: 0, tokens: 0, estimatedCost: 0, currentPlan: null, usagePercent: null, byDay: [],
    });
    return usageRepository.summary(client, storeId);
  }, [client, storeId]);

  const { data: summary, loading, error, refetch } = useAsync(fetch, [client, storeId], Boolean(client && storeId));

  return { summary, loading, error, refetch };
}

export function useUsageMonthly(months = 6) {
  const client = useSupabase();
  const { store } = useStore();
  const storeId = store?.id ?? null;

  const fetch = useCallback(() => {
    if (!client || !storeId) return Promise.resolve<Array<{ month: string; messages: number; tokens: number; cost: number }>>([]);
    return usageRepository.monthly(client, storeId, months);
  }, [client, storeId, months]);

  const { data: series, loading, error, refetch } = useAsync(fetch, [client, storeId, months], Boolean(client && storeId));

  return { series: series ?? [], loading, error, refetch };
}
