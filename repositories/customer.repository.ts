/**
 * Customers repository — `customers`, `customer_memories`.
 * Powers Customers page + customer profile panels (orders, LTV, memories).
 */
import type { Db } from "@/repositories/base";
import { ensureStoreId, guard } from "@/repositories/base";
import { mapCustomer } from "@/repositories/mappers";
import type { CustomerMemory } from "@/types/domain";
import type { CustomerFilters } from "@/types/api";

function mapMemory(row: {
  id: string;
  customer_id: string;
  store_id: string;
  kind: string | null;
  content: string;
  source: string | null;
  created_at: string;
}): CustomerMemory {
  return {
    id: row.id,
    customerId: row.customer_id,
    storeId: row.store_id,
    kind: row.kind,
    content: row.content,
    source: row.source,
    createdAt: row.created_at,
  };
}

export const customerRepository = {
  async list(client: Db, storeId: string, filters: CustomerFilters = {}) {
    return guard(async () => {
      const sid = ensureStoreId(storeId);
      let query = client
        .from("customers")
        .select("*", { count: "exact" })
        .eq("store_id", sid);

      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,telegram.ilike.%${filters.search}%`,
        );
      }
      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      const { data, error, count } = await query.order("created_at", {
        ascending: false,
      });
      if (error) throw error;

      return {
        customers: (data ?? []).map(mapCustomer),
        total: count ?? 0,
      };
    });
  },

  async findById(client: Db, customerId: string) {
    return guard(async () => {
      const { data, error } = await client
        .from("customers")
        .select("*")
        .eq("id", customerId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return mapCustomer(data);
    });
  },

  async update(client: Db, customerId: string, patch: Partial<{ notes: string; status: string }>) {
    return guard(async () => {
      const { data, error } = await client
        .from("customers")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", customerId)
        .select()
        .single();
      if (error) throw error;
      return mapCustomer(data);
    });
  },

  async updateProfile(client: Db, customerId: string, patch: { phone?: string; city?: string; email?: string; telegram?: string }) {
    return guard(async () => {
      const { data, error } = await client
        .from("customers")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", customerId)
        .select()
        .single();
      if (error) throw error;
      return mapCustomer(data);
    });
  },

  /** Customer + lifetime stats (orders, LTV) + recent memories. */
  async getProfile(client: Db, customerId: string) {
    return guard(async () => {
      const [customer, orders, memories] = await Promise.all([
        this.findById(client, customerId),
        client
          .from("orders")
          .select("*")
          .eq("customer_id", customerId)
          .order("created_at", { ascending: false }),
        client
          .from("customer_memories")
          .select("*")
          .eq("customer_id", customerId)
          .order("created_at", { ascending: false }),
      ]);
      if (!customer) return null;

      const rows = orders.data ?? [];
      const totalSpent = rows.reduce<number>((sum, o) => sum + (o.total ?? 0), 0);
      const delivered = rows.filter((o) => o.status === "delivered");
      const lastOrderAt = rows[0]?.created_at ?? null;

      return {
        customer,
        stats: {
          totalOrders: rows.length,
          totalSpent,
          avgOrderValue: rows.length ? totalSpent / rows.length : 0,
          deliveredCount: delivered.length,
          lastOrderAt,
        },
        memories: (memories.data ?? []).map(mapMemory),
      };
    });
  },

  async addMemory(
    client: Db,
    storeId: string,
    customerId: string,
    content: string,
    kind?: string | null,
    source?: string | null,
  ) {
    return guard(async () => {
      const sid = ensureStoreId(storeId);
      const { data, error } = await client
        .from("customer_memories")
        .insert({
          store_id: sid,
          customer_id: customerId,
          content,
          kind: kind ?? null,
          source: source ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return mapMemory(data);
    });
  },

  async deleteMemory(client: Db, memoryId: string) {
    return guard(async () => {
      const { error } = await client.from("customer_memories").delete().eq("id", memoryId);
      if (error) throw error;
    });
  },

  async counts(client: Db, storeId: string) {
    return guard(async () => {
      const sid = ensureStoreId(storeId);
      const { count, error } = await client
        .from("customers")
        .select("*", { count: "exact", head: true })
        .eq("store_id", sid);
      if (error) throw error;
      return count ?? 0;
    });
  },
};
