/**
 * Products repository — `products`, `product_media`.
 * Powers Products page (cards + table, images, price/stock/availability).
 */
import type { Db } from "@/repositories/base";
import { ensureStoreId, guard, rel } from "@/repositories/base";
import type { Product, ProductMedia, ProductWithMedia } from "@/types/domain";

export interface ProductFilters {
  search?: string | null;
  category?: string | null;
  status?: Product["status"] | "all" | null;
}

interface MediaRow {
  id: string;
  product_id: string;
  url: string;
  kind: string | null;
  position: number | null;
}

interface ProductRow {
  id: string;
  store_id: string;
  name: string;
  sku: string | null;
  category: string | null;
  description: string | null;
  price: number;
  cost: number | null;
  stock: number;
  low_stock_threshold: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  media?: MediaRow[];
}

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    storeId: row.store_id,
    name: row.name,
    sku: row.sku,
    category: row.category,
    description: row.description,
    price: row.price,
    cost: row.cost,
    stock: row.stock,
    lowStockThreshold: row.low_stock_threshold,
    status: (row.status as Product["status"]) ?? "active",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMedia(row: MediaRow): ProductMedia {
  return {
    id: row.id,
    productId: row.product_id,
    url: row.url,
    kind: row.kind,
    position: row.position,
  };
}

export type ProductInput = Pick<
  Product,
  "name" | "description" | "price" | "category" | "stock" | "status" | "sku" | "cost" | "lowStockThreshold"
>;

/** camelCase domain input → snake_case DB columns. */
function toColumns<T extends Partial<ProductInput>>(input: T) {
  const { lowStockThreshold, ...rest } = input;
  return {
    ...rest,
    low_stock_threshold: lowStockThreshold,
  };
}

export const productRepository = {
  async list(client: Db, storeId: string, filters: ProductFilters = {}) {
    return guard(async () => {
      const sid = ensureStoreId(storeId);
      let query = rel(client, "products").select(`*, media:product_media(order(position.asc))`);

      if (filters.search) {
        query = query.ilike("name", `%${filters.search}%`);
      }
      if (filters.category) {
        query = query.eq("category", filters.category);
      }
      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query.eq("store_id", sid).order("created_at", { ascending: false });
      if (error) throw error;

      return (data ?? []).map((row: ProductRow) => ({
        ...mapProduct(row),
        media: (row.media ?? []).map(mapMedia),
      })) as ProductWithMedia[];
    });
  },

  async findById(client: Db, productId: string): Promise<ProductWithMedia | null> {
    return guard(async () => {
      const { data, error } = await rel(client, "products")
        .select(`*, media:product_media(*)`)
        .eq("id", productId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const row = data as ProductRow;
      return {
        ...mapProduct(row),
        media: (row.media ?? []).map(mapMedia),
      } as ProductWithMedia;
    });
  },

  async create(client: Db, storeId: string, input: ProductInput): Promise<ProductWithMedia | null> {
    return guard(async () => {
      const sid = ensureStoreId(storeId);
      const { data, error } = await client
        .from("products")
        .insert({ store_id: sid, ...toColumns(input) })
        .select()
        .single();
      if (error) throw error;
      return this.findById(client, data.id);
    });
  },

  async update(client: Db, productId: string, patch: Partial<ProductInput>): Promise<ProductWithMedia | null> {
    return guard(async () => {
      const { error } = await client
        .from("products")
        .update({ ...toColumns(patch), updated_at: new Date().toISOString() })
        .eq("id", productId);
      if (error) throw error;
      return this.findById(client, productId);
    });
  },

  async remove(client: Db, productId: string) {
    return guard(async () => {
      const { error } = await client.from("products").delete().eq("id", productId);
      if (error) throw error;
    });
  },

  async addMedia(client: Db, productId: string, url: string, kind = "image") {
    return guard(async () => {
      const { data, error } = await client
        .from("product_media")
        .insert({ product_id: productId, url, kind })
        .select()
        .single();
      if (error) throw error;
      return mapMedia(data);
    });
  },

  async removeMedia(client: Db, mediaId: string) {
    return guard(async () => {
      const { error } = await client.from("product_media").delete().eq("id", mediaId);
      if (error) throw error;
    });
  },

  /** Distinct categories for the filter dropdown. */
  async categories(client: Db, storeId: string): Promise<string[]> {
    return guard(async () => {
      const sid = ensureStoreId(storeId);
      const { data, error } = await client
        .from("products")
        .select("category")
        .eq("store_id", sid)
        .not("category", "is", null);
      if (error) throw error;
      return Array.from(new Set((data ?? []).map((r) => r.category as string)));
    });
  },
};
