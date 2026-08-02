/**
 * Centralized, validated access to environment variables.
 *
 * Supabase credentials are intentionally NOT committed. Until they are
 * configured the application runs in "unconfigured" mode: UI/data layers
 * render empty + loading states and auth is skipped (see middleware.ts).
 *
 * @todo remove the `isConfigured` escape hatches once real credentials exist.
 */

export const env = {
  get supabaseUrl() {
    return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  },
  get supabaseAnonKey() {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  },
  get supabaseServiceRoleKey() {
    return process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  },
  get telegramBotToken() {
    return process.env.TELEGRAM_BOT_TOKEN ?? "";
  },
  get litellmBaseUrl() {
    return process.env.LITELLM_BASE_URL ?? "";
  },
  get litellmApiKey() {
    return process.env.LITELLM_API_KEY ?? "";
  },
};

/** True when the public Supabase pair is configured. */
export function isSupabaseConfigured(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

/** True when the server-only service role key is configured. */
export function hasServiceRole(): boolean {
  return Boolean(env.supabaseServiceRoleKey);
}

/**
 * Throws with a helpful message when a required Supabase env var is missing.
 * Used by server-only code paths (repositories, admin client) where running
 * without credentials would be a bug.
 */
export function requireSupabaseEnv(): { url: string; anonKey: string } {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment.",
    );
  }
  return { url: env.supabaseUrl, anonKey: env.supabaseAnonKey };
}
