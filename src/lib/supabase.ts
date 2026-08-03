import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client.
 *
 * Uses the service_role key, which bypasses RLS entirely. That is acceptable
 * here ONLY because this module is never imported by a client component —
 * every query runs in a server component or server action, behind the password
 * gate in middleware.ts.
 *
 * When per-store logins arrive this must become the anon key plus RLS policies
 * scoped to the signed-in user. See README, "Before real stores log in".
 */
export function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
