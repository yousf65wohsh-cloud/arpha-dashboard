/**
 * Services repository — `services`.
 * Simple CRUD for the Services page.
 */
import type { Db } from "@/repositories/base";
import { ensureStoreId, guard } from "@/repositories/base";
import type { Service } from "@/types/domain";

function mapService(row: {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number | null;
  category: string | null;
  status: string;
  bookings: number | null;
  rating: number | null;
  created_at: string;
  updated_at: string;
}): Service {
  return {
    id: row.id,
    storeId: row.store_id,
    name: row.name,
    description: row.description,
    price: row.price,
    durationMinutes: row.duration_minutes,
    category: row.category,
    status: (row.status as Service["status"]) ?? "active",
    bookings: row.bookings,
    rating: row.rating,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type ServiceInput = Pick<
  Service,
  "name" | "description" | "price" | "durationMinutes" | "category" | "status"
>;

export const serviceRepository = {
  async list(client: Db, storeId: string) {
    return guard(async () => {
      const sid = ensureStoreId(storeId);
      const { data, error } = await client
        .from("services")
        .select("*")
        .eq("store_id", sid)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapService);
    });
  },

  async create(client: Db, storeId: string, input: ServiceInput): Promise<Service> {
    return guard(async () => {
      const sid = ensureStoreId(storeId);
      const { durationMinutes, ...rest } = input;
      const { data, error } = await client
        .from("services")
        .insert({ store_id: sid, ...rest, duration_minutes: durationMinutes })
        .select()
        .single();
      if (error) throw error;
      return mapService(data);
    });
  },

  async update(client: Db, serviceId: string, patch: Partial<ServiceInput>): Promise<Service | null> {
    return guard(async () => {
      const { durationMinutes, ...rest } = patch;
      const { data, error } = await client
        .from("services")
        .update({ ...rest, duration_minutes: durationMinutes, updated_at: new Date().toISOString() })
        .eq("id", serviceId)
        .select()
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return mapService(data);
    });
  },

  async remove(client: Db, serviceId: string) {
    return guard(async () => {
      const { error } = await client.from("services").delete().eq("id", serviceId);
      if (error) throw error;
    });
  },
};
