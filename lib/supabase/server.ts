/**
 * Server (SSR) Supabase client using cookies for session management.
 * Uses the ANON key + RLS, resolved through the request cookies so that
 * `auth.getUser()` returns the signed-in user for this request.
 *
 * Must only be called from Server Components, Route Handlers or Server Actions.
 */
import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { requireSupabaseEnv } from "@/lib/env";

export async function createServerSupabaseClient(): Promise<
  SupabaseClient<Database>
> {
  const { url, anonKey } = requireSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component — safe to ignore, middleware
          // refreshes sessions on navigation.
        }
      },
    },
  });
}
