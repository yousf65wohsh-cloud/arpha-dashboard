/**
 * Admin Supabase client using the SERVICE ROLE key.
 * Server-only. Bypasses RLS — NEVER import this into client components.
 *
 * Used for privileged operations the owner cannot perform through RLS
 * (e.g. cross-store admin tasks, webhook verification, future Flutter BFF).
 */
import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { env, hasServiceRole } from "@/lib/env";

let _admin: SupabaseClient<Database> | null = null;

/** Returns null when the service role key is not configured. */
export function getAdminClient(): SupabaseClient<Database> | null {
  if (!hasServiceRole()) return null;
  if (_admin) return _admin;
  _admin = createClient<Database>(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return _admin;
}
