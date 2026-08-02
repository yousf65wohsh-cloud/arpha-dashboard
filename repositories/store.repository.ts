/**
 * Store repository — reads/writes the `stores` table and links the
 * authenticated owner to their store (one store per owner in V1).
 */
import type { Db } from "@/repositories/base";
import { ensureStoreId, guard } from "@/repositories/base";
import { mapStore } from "@/repositories/mappers";
import type { Store, BusinessHours, Plan } from "@/types/domain";

export const storeRepository = {
  /** Fetch the store owned by the given user id. */
  async findStoreByOwner(client: Db, ownerId: string): Promise<Store | null> {
    return guard(async () => {
      const { data, error } = await client
        .from("stores")
        .select("*")
        .eq("owner_id", ownerId)
        .maybeSingle();
      if (error) throw error;
      return data ? mapStore(data) : null;
    });
  },

  async findById(client: Db, storeId: string): Promise<Store | null> {
    return guard(async () => {
      const { data, error } = await client
        .from("stores")
        .select("*")
        .eq("id", ensureStoreId(storeId))
        .maybeSingle();
      if (error) throw error;
      return data ? mapStore(data) : null;
    });
  },

  async update(
    client: Db,
    storeId: string,
    patch: {
      name?: string;
      persona?: string | null;
      businessHours?: BusinessHours | null;
      botActive?: boolean;
      aiModel?: string | null;
      language?: string | null;
    },
  ): Promise<Store> {
    return guard(async () => {
      const { data, error } = await client
        .from("stores")
        .update({
          name: patch.name,
          persona: patch.persona,
          business_hours: patch.businessHours as never,
          bot_active: patch.botActive,
          ai_model: patch.aiModel,
          language: patch.language,
        })
        .eq("id", ensureStoreId(storeId))
        .select("*")
        .single();
      if (error) throw error;
      return mapStore(data);
    });
  },
};

export const planRepository = {
  async findById(client: Db, planId: string): Promise<Plan | null> {
    return guard(async () => {
      const { data, error } = await client
        .from("plans")
        .select("*")
        .eq("id", planId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        features: (data.features as string[] | null) ?? null,
        tokenLimit: data.token_limit,
        active: data.active,
        createdAt: data.created_at,
      };
    });
  },
};
