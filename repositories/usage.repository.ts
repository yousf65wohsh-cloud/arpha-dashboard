/**
 * AI usage repository — `usage_events`.
 * Powers the AI Usage page (messages, tokens, cost, plan %, monthly graph).
 */
import type { Db } from "@/repositories/base";
import { ensureStoreId, guard } from "@/repositories/base";
import type { UsageEvent, UsageSummary } from "@/types/domain";

interface UsageRow {
  id: string;
  store_id: string;
  event_type: string;
  agent: string | null;
  model: string | null;
  tokens: number | null;
  cost: number | null;
  metadata: unknown;
  created_at: string;
}

function mapUsage(row: UsageRow): UsageEvent {
  return {
    id: row.id,
    storeId: row.store_id,
    eventType: row.event_type,
    agent: row.agent,
    model: row.model,
    tokens: row.tokens,
    cost: row.cost,
    metadata: (row.metadata as Record<string, unknown> | null) ?? null,
    createdAt: row.created_at,
  };
}

export interface UsageFilters {
  from?: string | null;
  to?: string | null;
}

export const usageRepository = {
  async list(client: Db, storeId: string, filters: UsageFilters = {}) {
    return guard(async () => {
      const sid = ensureStoreId(storeId);
      let query = client
        .from("usage_events")
        .select("*")
        .eq("store_id", sid)
        .order("created_at", { ascending: false });

      if (filters.from) query = query.gte("created_at", filters.from);
      if (filters.to) query = query.lte("created_at", filters.to);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map(mapUsage);
    });
  },

  /** Aggregate current month for the AI Usage summary card. */
  async summary(client: Db, storeId: string): Promise<UsageSummary> {
    return guard(async () => {
      const sid = ensureStoreId(storeId);
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { data, error } = await client
        .from("usage_events")
        .select("*")
        .eq("store_id", sid)
        .gte("created_at", monthStart)
        .order("created_at", { ascending: true });
      if (error) throw error;

      const rows = data ?? [];
      const total = rows.reduce(
        (acc, r) => ({
          messages: acc.messages + 1,
          tokens: acc.tokens + (r.tokens ?? 0),
          cost: acc.cost + (r.cost ?? 0),
        }),
        { messages: 0, tokens: 0, cost: 0 },
      );

      const byDay = new Map<string, { tokens: number; cost: number }>();
      for (const row of rows) {
        const key = row.created_at.slice(0, 10); // YYYY-MM-DD
        const b = byDay.get(key) ?? { tokens: 0, cost: 0 };
        b.tokens += row.tokens ?? 0;
        b.cost += row.cost ?? 0;
        byDay.set(key, b);
      }

      return {
        messages: total.messages,
        tokens: total.tokens,
        estimatedCost: total.cost,
        // Plan quota unknown until stores→plans is joined — TODO store.plan quota.
        currentPlan: null,
        usagePercent: null,
        byDay: Array.from(byDay.entries()).map(([date, v]) => ({ date, ...v })),
      };
    });
  },

  /** Monthly breakdown for the usage chart (last `months` months). */
  async monthly(client: Db, storeId: string, months = 6) {
    return guard(async () => {
      const sid = ensureStoreId(storeId);
      const from = new Date();
      from.setMonth(from.getMonth() - (months - 1), 1);
      from.setHours(0, 0, 0, 0);

      const { data, error } = await client
        .from("usage_events")
        .select("*")
        .eq("store_id", sid)
        .gte("created_at", from.toISOString());
      if (error) throw error;

      const buckets = new Map<string, { messages: number; tokens: number; cost: number }>();
      for (const row of data ?? []) {
        const key = row.created_at.slice(0, 7); // YYYY-MM
        const b = buckets.get(key) ?? { messages: 0, tokens: 0, cost: 0 };
        b.messages += 1;
        b.tokens += row.tokens ?? 0;
        b.cost += row.cost ?? 0;
        buckets.set(key, b);
      }

      const series: Array<{ month: string; messages: number; tokens: number; cost: number }> = [];
      for (let i = months - 1; i >= 0; i--) {
        const d = new Date(from.getFullYear(), from.getMonth() + i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const b = buckets.get(key) ?? { messages: 0, tokens: 0, cost: 0 };
        series.push({ month: key, ...b });
      }
      return series;
    });
  },
};
