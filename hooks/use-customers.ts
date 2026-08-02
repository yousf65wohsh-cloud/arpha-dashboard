/**
 * Customers hooks — list, profile (LTV/stats), memories.
 */
import { useCallback } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useStore } from "@/hooks/use-store";
import { useAsync } from "@/hooks/use-async";
import { customerRepository } from "@/repositories";
import type { Customer, CustomerMemory } from "@/types/domain";
import type { CustomerFilters } from "@/types/api";

export function useCustomers(filters: CustomerFilters = {}) {
  const client = useSupabase();
  const { store } = useStore();
  const storeId = store?.id ?? null;
  const { search, status } = filters;

  const fetch = useCallback(() => {
    if (!client || !storeId) return Promise.resolve({ customers: [] as Customer[], total: 0 });
    return customerRepository.list(client, storeId, { search, status });
  }, [client, storeId, search, status]);

  const { data, loading, error, refetch, setData } = useAsync(fetch, [
    client,
    storeId,
    search,
    status,
  ], Boolean(client && storeId));

  const updateProfile = useCallback(
    async (customerId: string, patch: { phone?: string; city?: string; email?: string; telegram?: string }) => {
      if (!client) return null;
      const updated = await customerRepository.updateProfile(client, customerId, patch);
      void refetch();
      return updated;
    },
    [client, refetch],
  );

  const updateStatus = useCallback(
    async (customerId: string, nextStatus: string) => {
      if (!client) return null;
      const updated = await customerRepository.update(client, customerId, { status: nextStatus });
      void refetch();
      return updated;
    },
    [client, refetch],
  );

  return {
    customers: data?.customers ?? [],
    total: data?.total ?? 0,
    loading,
    error,
    refetch,
    setCustomers: setData,
    updateProfile,
    updateStatus,
  };
}

export interface CustomerProfile {
  customer: Customer;
  stats: {
    totalOrders: number;
    totalSpent: number;
    avgOrderValue: number;
    deliveredCount: number;
    lastOrderAt: string | null;
  };
  memories: CustomerMemory[];
}

export function useCustomerCount() {
  const client = useSupabase();
  const { store } = useStore();
  const storeId = store?.id ?? null;

  const fetch = useCallback(() => {
    if (!client || !storeId) return Promise.resolve(0);
    return customerRepository.counts(client, storeId);
  }, [client, storeId]);

  const { data: count, loading } = useAsync(fetch, [client, storeId], Boolean(client && storeId));

  return { count: count ?? 0, loading };
}

export function useCustomerProfile(customerId: string | null) {
  const client = useSupabase();
  const { store } = useStore();
  const storeId = store?.id ?? null;

  const fetch = useCallback(() => {
    if (!client || !customerId) return Promise.resolve<CustomerProfile | null>(null);
    return customerRepository.getProfile(client, customerId);
  }, [client, customerId]);

  const { data, loading, error, refetch, setData } = useAsync<CustomerProfile | null>(
    fetch,
    [client, customerId],
    Boolean(client && customerId),
  );

  const addMemory = useCallback(
    async (content: string, kind?: string | null) => {
      if (!client || !customerId || !storeId) return null;
      const memory = await customerRepository.addMemory(client, storeId, customerId, content, kind);
      void refetch();
      return memory;
    },
    [client, storeId, customerId, refetch],
  );

  const updateStatus = useCallback(
    async (nextStatus: string) => {
      if (!client || !customerId) return null;
      const updated = await customerRepository.update(client, customerId, { status: nextStatus });
      void refetch();
      return updated;
    },
    [client, customerId, refetch],
  );

  const deleteMemory = useCallback(
    async (memoryId: string) => {
      if (!client) return;
      await customerRepository.deleteMemory(client, memoryId);
      void refetch();
    },
    [client, refetch],
  );

  return {
    profile: data,
    loading,
    error,
    refetch,
    addMemory,
    deleteMemory,
    updateStatus,
    setProfile: setData,
  };
}
