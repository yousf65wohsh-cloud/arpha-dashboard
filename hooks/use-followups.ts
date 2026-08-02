/**
 * Notifications hooks — pending followups surfaced by the AI bot.
 */
import { useCallback } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useStore } from "@/hooks/use-store";
import { useAsync } from "@/hooks/use-async";
import { followupRepository } from "@/repositories";
import type { FollowupStatus } from "@/lib/supabase/database.types";
import type { Customer, PendingFollowup } from "@/types/domain";

export type FollowupWithCustomer = PendingFollowup & {
  customer: Customer | null;
};

export function useFollowups(status: FollowupStatus | "all" = "all") {
  const client = useSupabase();
  const { store } = useStore();
  const storeId = store?.id ?? null;

  const fetch = useCallback(() => {
    if (!client || !storeId) return Promise.resolve<FollowupWithCustomer[]>([]);
    return followupRepository.list(client, storeId, { status });
  }, [client, storeId, status]);

  const { data: followups, loading, error, refetch, setData } = useAsync(fetch, [client, storeId, status], Boolean(client && storeId));

  const resolve = useCallback(
    async (id: string) => {
      if (!client) return;
      await followupRepository.resolve(client, id);
      void refetch();
    },
    [client, refetch],
  );

  return { followups, loading, error, refetch, setFollowups: setData, resolve };
}

export function useOutstandingFollowups() {
  const client = useSupabase();
  const { store } = useStore();
  const storeId = store?.id ?? null;

  const fetch = useCallback(() => {
    if (!client || !storeId) return Promise.resolve(0);
    return followupRepository.outstandingCount(client, storeId);
  }, [client, storeId]);

  const { data: count, loading, refetch } = useAsync(fetch, [client, storeId], Boolean(client && storeId));

  return { count: count ?? 0, loading, refetch };
}
