/**
 * Services hooks — CRUD.
 */
import { useCallback } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useStore } from "@/hooks/use-store";
import { useAsync } from "@/hooks/use-async";
import { serviceRepository, type ServiceInput } from "@/repositories";
import type { Service } from "@/types/domain";

export function useServices() {
  const client = useSupabase();
  const { store } = useStore();
  const storeId = store?.id ?? null;

  const fetch = useCallback(() => {
    if (!client || !storeId) return Promise.resolve<Service[]>([]);
    return serviceRepository.list(client, storeId);
  }, [client, storeId]);

  const { data: services, loading, error, refetch, setData } = useAsync(fetch, [client, storeId], Boolean(client && storeId));

  const create = useCallback(
    async (input: ServiceInput) => {
      if (!client || !storeId) return null;
      const created = await serviceRepository.create(client, storeId, input);
      void refetch();
      return created;
    },
    [client, storeId, refetch],
  );

  const update = useCallback(
    async (serviceId: string, patch: Partial<ServiceInput>) => {
      if (!client) return null;
      const updated = await serviceRepository.update(client, serviceId, patch);
      void refetch();
      return updated;
    },
    [client, refetch],
  );

  const remove = useCallback(
    async (serviceId: string) => {
      if (!client) return;
      await serviceRepository.remove(client, serviceId);
      void refetch();
    },
    [client, refetch],
  );

  return { services, loading, error, refetch, setServices: setData, create, update, remove };
}
