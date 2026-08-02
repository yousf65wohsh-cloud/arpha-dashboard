/**
 * Reports repository — derives revenue/orders/customers series + top products
 * from `orders` and `order_items`. Granularity: daily/weekly/monthly/yearly.
 */
import type { Db } from "@/repositories/base";
import { ensureStoreId, guard, rel } from "@/repositories/base";
import type { ReportGranularity, ReportPoint, ReportSummary, TopProduct } from "@/types/domain";

export interface ReportFilters {
  granularity?: ReportGranularity;
  from?: string | null;
  to?: string | null;
}

interface ItemRow {
  order_id: string;
  product_id: string | null;
  name: string;
  qty: number;
  total: number;
}

function bucketKey(date: Date, granularity: ReportGranularity): string {
  const iso = date.toISOString();
  switch (granularity) {
    case "daily":
      return iso.slice(0, 10);
    case "monthly":
      return iso.slice(0, 7);
    case "yearly":
      return iso.slice(0, 4);
    case "weekly": {
      const day = date.getDay(); // 0 (Sun)..6
      const mondayOffset = (day + 6) % 7;
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - mondayOffset);
      weekStart.setHours(0, 0, 0, 0);
      return weekStart.toISOString().slice(0, 10);
    }
  }
}

export const reportRepository = {
  async summary(client: Db, storeId: string, filters: ReportFilters = {}): Promise<ReportSummary> {
    return guard(async () => {
      const sid = ensureStoreId(storeId);
      const granularity = filters.granularity ?? "daily";

      let query = client.from("orders").select("*").eq("store_id", sid);
      if (filters.from) query = query.gte("created_at", filters.from);
      if (filters.to) query = query.lte("created_at", filters.to);
      const { data: orders, error } = await query;
      if (error) throw error;

      const rows = orders ?? [];

      // Top products from order_items (scope to these orders).
      const { data: items, error: itemsError } = await rel(client, "order_items")
        .select("order_id, product_id, name, qty, total")
        .in(
          "order_id",
          rows.map((o) => o.id),
        );
      if (itemsError) throw itemsError;

      const buckets = new Map<string, ReportPoint>();
      const customerSeen = new Map<string, Set<string>>();

      for (const order of rows) {
        const key = bucketKey(new Date(order.created_at), granularity);
        const b = buckets.get(key) ?? {
          bucket: key,
          revenue: 0,
          orders: 0,
          customers: 0,
          cancelledOrders: 0,
          conversion: 0,
        };
        b.orders += 1;
        if (order.status === "delivered") b.revenue += order.total ?? 0;
        if (order.status === "cancelled") b.cancelledOrders += 1;
        if (order.customer_id) {
          const seen = customerSeen.get(key) ?? new Set<string>();
          if (!seen.has(order.customer_id)) {
            seen.add(order.customer_id);
            customerSeen.set(key, seen);
          }
        }
        buckets.set(key, b);
      }

      for (const [key, b] of buckets) {
        b.customers = customerSeen.get(key)?.size ?? 0;
      }

      // delivered count within bucket for conversion
      const deliveredPerBucket = new Map<string, number>();
      for (const order of rows) {
        if (order.status === "delivered") {
          const key = bucketKey(new Date(order.created_at), granularity);
          deliveredPerBucket.set(key, (deliveredPerBucket.get(key) ?? 0) + 1);
        }
      }
      for (const [key, b] of buckets) {
        const delivered = deliveredPerBucket.get(key) ?? 0;
        b.conversion = b.orders ? delivered / b.orders : 0;
      }

      const series = Array.from(buckets.values()).sort((a, c) => a.bucket.localeCompare(c.bucket));

      // Top products aggregated across the whole period.
      const productTotals = new Map<string, TopProduct>();
      for (const item of (items ?? []) as ItemRow[]) {
        const key = item.product_id ?? `adhoc:${item.name}`;
        const t = productTotals.get(key) ?? { productId: item.product_id ?? "", name: item.name, quantity: 0, revenue: 0 };
        t.quantity += item.qty;
        t.revenue += item.total;
        productTotals.set(key, t);
      }
      const topProducts = Array.from(productTotals.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      const deliveredCount = rows.filter((o) => o.status === "delivered").length;
      const cancelledCount = rows.filter((o) => o.status === "cancelled").length;

      return {
        series,
        topProducts,
        totals: {
          revenue: series.reduce((sum, p) => sum + p.revenue, 0),
          orders: series.reduce((sum, p) => sum + p.orders, 0),
          customers: series.reduce((sum, p) => sum + p.customers, 0),
          cancelledOrders: cancelledCount,
          conversion: rows.length ? deliveredCount / rows.length : 0,
        },
      };
    });
  },
};
