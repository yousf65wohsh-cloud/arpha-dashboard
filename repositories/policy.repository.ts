/**
 * Policies repository — `policies`.
 * Editable instructions (key/title/content, toggled via `enabled`) that steer
 * the AI bot on the Policies page.
 */
import type { Db } from "@/repositories/base";
import { ensureStoreId, guard } from "@/repositories/base";
import type { Policy } from "@/types/domain";

function mapPolicy(row: {
  id: string;
  store_id: string;
  key: string | null;
  title: string | null;
  content: string;
  enabled: boolean;
  position: number | null;
  created_at: string;
  updated_at: string;
}): Policy {
  return {
    id: row.id,
    storeId: row.store_id,
    key: row.key,
    title: row.title,
    content: row.content,
    enabled: row.enabled,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type PolicyInput = {
  title: string;
  content: string;
  enabled?: boolean;
  key?: string | null;
};

export const policyRepository = {
  async list(client: Db, storeId: string) {
    return guard(async () => {
      const sid = ensureStoreId(storeId);
      const { data, error } = await client
        .from("policies")
        .select("*")
        .eq("store_id", sid)
        .order("position", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapPolicy);
    });
  },

  async create(client: Db, storeId: string, input: PolicyInput): Promise<Policy> {
    return guard(async () => {
      const sid = ensureStoreId(storeId);
      const { data, error } = await client
        .from("policies")
        .insert({ store_id: sid, ...input })
        .select()
        .single();
      if (error) throw error;
      return mapPolicy(data);
    });
  },

  async update(client: Db, policyId: string, patch: Partial<PolicyInput>): Promise<Policy | null> {
    return guard(async () => {
      const { data, error } = await client
        .from("policies")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", policyId)
        .select()
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return mapPolicy(data);
    });
  },

  async setEnabled(client: Db, policyId: string, enabled: boolean) {
    return guard(async () => {
      const { error } = await client
        .from("policies")
        .update({ enabled, updated_at: new Date().toISOString() })
        .eq("id", policyId);
      if (error) throw error;
    });
  },

  async remove(client: Db, policyId: string) {
    return guard(async () => {
      const { error } = await client.from("policies").delete().eq("id", policyId);
      if (error) throw error;
    });
  },
};
