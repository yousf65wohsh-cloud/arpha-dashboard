/**
 * Browser (client) Supabase client.
 * Uses the ANON key + RLS. Never use the service role key here.
 *
 * When Supabase is not configured yet (env placeholders), returns null so
 * hooks can render empty/loading states instead of crashing.
 */
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { isSupabaseConfigured, env } from "@/lib/env";

let _client: SupabaseClient<Database> | null = null;

/** Lazily created singleton. Returns null when env vars are missing. */
export function getBrowserClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) return null;
  if (_client) return _client;
  _client = createBrowserClient<Database>(env.supabaseUrl, env.supabaseAnonKey);
  return _client;
}

/** Non-null variant for code paths that require a configured client. */
export function getBrowserClientOrThrow(): SupabaseClient<Database> {
  const client = getBrowserClient();
  if (!client) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  return client;
}
