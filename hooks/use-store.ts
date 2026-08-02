/**
 * Current owner store hook. One store per owner: resolves the signed-in
 * user's store via `stores.owner_id` and provides it to feature hooks.
 */
import { useCallback } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useSession } from "@/hooks/use-session";
import { useAsync } from "@/hooks/use-async";
import { storeRepository } from "@/repositories";
import type { Store, BusinessHours } from "@/types/domain";

export function useStore() {
  const client = useSupabase();
  const { user } = useSession();
  const userId = user?.id ?? null;

  const fetch = useCallback(() => {
    if (!client || !userId) return Promise.resolve(null);
    return storeRepository.findStoreByOwner(client, userId);
  }, [client, userId]);

  const { data: store, loading, error, refetch, setData } = useAsync<Store | null>(
    fetch,
    [client, userId],
    Boolean(client && userId),
  );

  const update = useCallback(
    async (patch: {
      name?: string;
      persona?: string | null;
      businessHours?: BusinessHours | null;
      botActive?: boolean;
      aiModel?: string | null;
      language?: string | null;
    }) => {
      if (!client || !store) return null;
      const updated = await storeRepository.update(client, store.id, patch);
      setData(updated);
      return updated;
    },
    [client, store, setData],
  );

  return { store, loading, error, refetch, setStore: setData, update };
}
