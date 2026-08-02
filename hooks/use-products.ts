/**
 * Products hooks — list with filters + CRUD.
 */
import { useCallback } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useStore } from "@/hooks/use-store";
import { useAsync } from "@/hooks/use-async";
import { productRepository, type ProductFilters, type ProductInput } from "@/repositories";
import type { ProductWithMedia } from "@/types/domain";

export function useProducts(filters: ProductFilters = {}) {
  const client = useSupabase();
  const { store } = useStore();
  const storeId = store?.id ?? null;
  const { search, category, status } = filters;

  const fetch = useCallback(() => {
    if (!client || !storeId) return Promise.resolve<ProductWithMedia[]>([]);
    return productRepository.list(client, storeId, { search, category, status });
  }, [client, storeId, search, category, status]);

  const { data: products, loading, error, refetch, setData } = useAsync(fetch, [
    client,
    storeId,
    search,
    category,
    status,
  ], Boolean(client && storeId));

  const create = useCallback(
    async (input: ProductInput) => {
      if (!client || !storeId) return null;
      const created = await productRepository.create(client, storeId, input);
      void refetch();
      return created;
    },
    [client, storeId, refetch],
  );

  const update = useCallback(
    async (productId: string, patch: Partial<ProductInput>) => {
      if (!client) return null;
      const updated = await productRepository.update(client, productId, patch);
      void refetch();
      return updated;
    },
    [client, refetch],
  );

  const remove = useCallback(
    async (productId: string) => {
      if (!client) return;
      await productRepository.remove(client, productId);
      void refetch();
    },
    [client, refetch],
  );

  return { products, loading, error, refetch, setProducts: setData, create, update, remove };
}
