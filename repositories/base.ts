/**
 * Shared repository helpers.
 *
 * Repositories are plain functions that accept a `SupabaseClient` + a
 * `storeId` and return typed domain models. They are isomorphic (client or
 * server client) which keeps them reusable by hooks, route handlers and a
 * future Flutter BFF.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { toAppError } from "@/lib/errors";

export type Db = SupabaseClient<Database>;

export function ensureStoreId(storeId: string | null | undefined): string {
  if (!storeId) {
    throw toAppError(
      new Error("No active store for this session. Ensure the owner has a store."),
    );
  }
  return storeId;
}

/** Guards a repository call, normalizing thrown values to AppError. */
export async function guard<T>(fn: () => Promise<T> | T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    throw toAppError(error);
  }
}

/**
 * Relation-embedding query builder.
 *
 * The inferred schema ships with empty `Relationships`, so supabase-js can't
 * type embedded relations (e.g. `customer:customers(*)`) yet. `rel` returns an
 * untyped builder for those queries; repositories cast resolved rows to local
 * row interfaces. Once `supabase gen types` populates `Relationships`, replace
 * `rel` calls with the typed builder and drop the local casts.
 *
 * @todo drop after regenerating types with the Supabase CLI
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function rel(client: Db, table: string): any {
  return client.from(table as never);
}
