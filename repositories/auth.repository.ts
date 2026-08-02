/**
 * Authentication repository — the single place that talks to Supabase Auth.
 * V1 uses simple email/password (per product decision). Sessions are managed
 * through Supabase SSR cookies; this repository is client-side friendly.
 */
import type { Db } from "@/repositories/base";
import { guard } from "@/repositories/base";

export interface AuthSession {
  user: { id: string; email: string | null } | null;
}

export const authRepository = {
  async signInWithPassword(client: Db, email: string, password: string) {
    return guard(async () => {
      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      return data;
    });
  },

  async signOut(client: Db) {
    return guard(async () => {
      const { error } = await client.auth.signOut();
      if (error) throw error;
    });
  },

  async getSession(client: Db): Promise<AuthSession> {
    return guard(async () => {
      const {
        data: { session },
      } = await client.auth.getSession();
      if (!session) return { user: null };
      return {
        user: {
          id: session.user.id,
          email: session.user.email ?? null,
        },
      };
    });
  },
};
