/**
 * Pending followups repository — `pending_followups`.
 * Drives the Notifications page: questions the AI bot surfaced to the owner
 * (`question`, `type`) that are awaiting a decision.
 */
import type { Db } from "@/repositories/base";
import { ensureStoreId, guard, rel } from "@/repositories/base";
import type { FollowupStatus } from "@/lib/supabase/database.types";
import type { Customer, PendingFollowup } from "@/types/domain";

interface FollowupRow {
  id: string;
  store_id: string;
  conversation_id: string | null;
  customer_id: string | null;
  type: string | null;
  question: string;
  status: FollowupStatus;
  resolved_at: string | null;
  created_at: string;
  customer?: Customer | null;
}

function mapFollowup(row: FollowupRow): PendingFollowup {
  return {
    id: row.id,
    storeId: row.store_id,
    conversationId: row.conversation_id,
    customerId: row.customer_id,
    type: row.type,
    question: row.question,
    payload: null,
    status: row.status,
    resolvedAt: row.resolved_at,
    createdAt: row.created_at,
  };
}

export interface FollowupFilters {
  status?: FollowupStatus | "all" | null;
}

export const followupRepository = {
  async list(
    client: Db,
    storeId: string,
    filters: FollowupFilters = {},
  ): Promise<Array<PendingFollowup & { customer: Customer | null }>> {
    return guard(async () => {
      const sid = ensureStoreId(storeId);
      let query = rel(client, "pending_followups").select(`*, customer:customers(*)`);

      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query
        .eq("store_id", sid)
        .order("created_at", { ascending: false });
      if (error) throw error;

      return (data ?? []).map((row: FollowupRow) => ({
        ...mapFollowup(row),
        customer: row.customer ?? null,
      }));
    });
  },

  /** Unresolved count for the sidebar badge. */
  async outstandingCount(client: Db, storeId: string): Promise<number> {
    return guard(async () => {
      const sid = ensureStoreId(storeId);
      const { count, error } = await client
        .from("pending_followups")
        .select("*", { count: "exact", head: true })
        .eq("store_id", sid)
        .eq("status", "pending");
      if (error) throw error;
      return count ?? 0;
    });
  },

  /** Mark a follow-up as handled. */
  async resolve(client: Db, followupId: string) {
    return guard(async () => {
      const { error } = await client
        .from("pending_followups")
        .update({ status: "resolved", resolved_at: new Date().toISOString() })
        .eq("id", followupId);
      if (error) throw error;
    });
  },

  async updateStatus(client: Db, followupId: string, status: FollowupStatus) {
    return guard(async () => {
      const { error } = await client
        .from("pending_followups")
        .update({
          status,
          resolved_at: status === "resolved" ? new Date().toISOString() : null,
        })
        .eq("id", followupId);
      if (error) throw error;
    });
  },
};
