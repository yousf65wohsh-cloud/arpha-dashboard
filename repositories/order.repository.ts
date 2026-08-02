/**
 * Orders repository — `orders`, `order_items`, `order_status_log`.
 * Status transitions are append-only via the log table (audit trail).
 */
import type { Db } from "@/repositories/base";
import { ensureStoreId, guard, rel } from "@/repositories/base";
import type { OrderChannel, OrderStatus } from "@/lib/supabase/database.types";
import type {
  Customer,
  Order,
  OrderDetail,
  OrderItem,
  OrderStatusLog,
} from "@/types/domain";
import type { OrderFilters } from "@/types/api";

interface OrderRow {
  id: string;
  store_id: string;
  customer_id: string | null;
  channel: OrderChannel;
  status: OrderStatus;
  payment_method: Order["paymentMethod"];
  city: string | null;
  address: string | null;
  notes: string | null;
  total: number | null;
  created_at: string;
  updated_at: string;
  customer?: Customer | null;
  items?: ItemRow[];
  status_log?: LogRow[];
}

interface ItemRow {
  id: string;
  order_id: string;
  product_id: string | null;
  name: string;
  qty: number;
  unit_price: number;
  total: number;
}

interface LogRow {
  id: string;
  order_id: string;
  from_status: string | null;
  to_status: string;
  actor: string | null;
  note: string | null;
  created_at: string;
}

function mapOrder(row: OrderRow): Order {
  return {
    id: row.id,
    storeId: row.store_id,
    customerId: row.customer_id,
    channel: row.channel,
    status: row.status,
    paymentMethod: row.payment_method,
    city: row.city,
    address: row.address,
    notes: row.notes,
    total: row.total,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapItem(row: ItemRow): OrderItem {
  return {
    id: row.id,
    orderId: row.order_id,
    productId: row.product_id,
    name: row.name,
    qty: row.qty,
    unitPrice: row.unit_price,
    total: row.total,
  };
}

function mapLog(row: LogRow): OrderStatusLog {
  return {
    id: row.id,
    orderId: row.order_id,
    fromStatus: row.from_status,
    toStatus: row.to_status,
    actor: row.actor,
    note: row.note,
    createdAt: row.created_at,
  };
}

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "rejected",
  "delivered",
  "cancelled",
];

export const orderRepository = {
  /** List orders with embedded customer (no items/log — see findById). */
  async list(
    client: Db,
    storeId: string,
    filters: OrderFilters = {},
  ): Promise<Array<Order & { customer: Customer | null }>> {
    return guard(async () => {
      const sid = ensureStoreId(storeId);
      let query = rel(client, "orders").select(`*, customer:customers(*)`);

      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status as OrderStatus);
      }
      if (filters.channel && filters.channel !== "all") {
        query = query.eq("channel", filters.channel as OrderChannel);
      }
      if (filters.dateFrom) {
        query = query.gte("created_at", filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte("created_at", filters.dateTo);
      }
      if (filters.search) {
        query = query.or(`id.ilike.%${filters.search}%,city.ilike.%${filters.search}%`);
      }

      const { data, error } = await query
        .eq("store_id", sid)
        .order("created_at", { ascending: false });
      if (error) throw error;

      return (data ?? []).map((row: OrderRow) => ({
        ...mapOrder(row),
        customer: row.customer ?? null,
      }));
    });
  },

  async findById(client: Db, orderId: string): Promise<OrderDetail | null> {
    return guard(async () => {
      const { data, error } = await rel(client, "orders")
        .select(
          `*,
           customer:customers(*),
           items:order_items(*),
           status_log:order_status_log(order(created_at.asc))`,
        )
        .eq("id", orderId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const row = data as OrderRow;
      return {
        ...mapOrder(row),
        customer: row.customer ?? null,
        items: (row.items ?? []).map(mapItem),
        statusLog: (row.status_log ?? []).map(mapLog),
      };
    });
  },

  /** Transition an order to a new status, writing an audit log entry. */
  async updateStatus(
    client: Db,
    orderId: string,
    toStatus: OrderStatus,
    note?: string | null,
  ): Promise<OrderDetail | null> {
    return guard(async () => {
      const { data: current, error: getError } = await client
        .from("orders")
        .select("status")
        .eq("id", orderId)
        .maybeSingle();
      if (getError) throw getError;
      if (!current) return null;

      const fromStatus = current.status;
      if (fromStatus === toStatus) return this.findById(client, orderId);

      const { error } = await client.from("orders").update({ status: toStatus }).eq("id", orderId);
      if (error) throw error;

      const { error: logError } = await client.from("order_status_log").insert({
        order_id: orderId,
        from_status: fromStatus,
        to_status: toStatus,
        actor: "owner",
        note: note ?? null,
      });
      if (logError) throw logError;

      return this.findById(client, orderId);
    });
  },

  /** Count orders per status (drives the Pending/Confirmed/… tabs). */
  async statusCounts(client: Db, storeId: string): Promise<Record<OrderStatus, number>> {
    return guard(async () => {
      const sid = ensureStoreId(storeId);
      const counts = await Promise.all(
        ORDER_STATUSES.map(async (status) => {
          const { count, error } = await client
            .from("orders")
            .select("*", { count: "exact", head: true })
            .eq("store_id", sid)
            .eq("status", status);
          if (error) throw error;
          return [status, count ?? 0] as const;
        }),
      );
      return Object.fromEntries(counts) as Record<OrderStatus, number>;
    });
  },

  /** Today's + pending counts for the Overview KPI cards. */
  async overviewCounts(client: Db, storeId: string) {
    return guard(async () => {
      const sid = ensureStoreId(storeId);
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const iso = startOfDay.toISOString();

      const [today, pending, revenue] = await Promise.all([
        client
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("store_id", sid)
          .gte("created_at", iso),
        client
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("store_id", sid)
          .eq("status", "pending"),
        client
          .from("orders")
          .select("total")
          .eq("store_id", sid)
          .eq("status", "delivered"),
      ]);

      const revenueTotal = (revenue.data ?? []).reduce<number>(
        (sum, row) => sum + (row.total ?? 0),
        0,
      );

      return {
        today: today.count ?? 0,
        pending: pending.count ?? 0,
        revenue: revenueTotal,
      };
    });
  },
};
