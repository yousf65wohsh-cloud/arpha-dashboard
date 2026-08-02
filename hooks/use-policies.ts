/**
 * Policies hooks — CRUD + toggle.
 */
import { useCallback } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useStore } from "@/hooks/use-store";
import { useAsync } from "@/hooks/use-async";
import { policyRepository, type PolicyInput } from "@/repositories";
import type { Policy } from "@/types/domain";

export function usePolicies() {
  const client = useSupabase();
  const { store } = useStore();
  const storeId = store?.id ?? null;

  const fetch = useCallback(() => {
    if (!client || !storeId) return Promise.resolve<Policy[]>([]);
    return policyRepository.list(client, storeId);
  }, [client, storeId]);

  const { data: policies, loading, error, refetch, setData } = useAsync(fetch, [client, storeId], Boolean(client && storeId));

  const create = useCallback(
    async (input: PolicyInput) => {
      if (!client || !storeId) return null;
      const created = await policyRepository.create(client, storeId, input);
      void refetch();
      return created;
    },
    [client, storeId, refetch],
  );

  const update = useCallback(
    async (policyId: string, patch: Partial<PolicyInput>) => {
      if (!client) return null;
      const updated = await policyRepository.update(client, policyId, patch);
      void refetch();
      return updated;
    },
    [client, refetch],
  );

  const setEnabled = useCallback(
    async (policyId: string, enabled: boolean) => {
      if (!client) return;
      await policyRepository.setEnabled(client, policyId, enabled);
      void refetch();
    },
    [client, refetch],
  );

  const remove = useCallback(
    async (policyId: string) => {
      if (!client) return;
      await policyRepository.remove(client, policyId);
      void refetch();
    },
    [client, refetch],
  );

  return { policies, loading, error, refetch, setPolicies: setData, create, update, setEnabled, remove };
}
