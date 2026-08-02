/**
 * Access to the browser Supabase client from React.
 * Returns `null` in unconfigured mode (no env keys) so feature hooks can
 * render empty/loading states instead of crashing.
 */
import { getBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

export function useSupabase(): SupabaseClient<Database> | null {
  return getBrowserClient();
}
