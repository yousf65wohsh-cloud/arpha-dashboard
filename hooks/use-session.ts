/**
 * Auth session hook. Simple email/password via Supabase Auth
 * (owner choice: "user name and password, that's all").
 */
import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { useSupabase } from "@/hooks/use-supabase";
import { toAppError } from "@/lib/errors";
import type { AppError } from "@/lib/errors";

export interface UseSessionResult {
  session: Session | null;
  user: Session["user"] | null;
  loading: boolean;
  error: AppError | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export function useSession(): UseSessionResult {
  const client = useSupabase();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);

  useEffect(() => {
    if (!client) {
      setLoading(false);
      return;
    }
    let active = true;
    void client.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = client.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [client]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!client) {
        setError(
          toAppError(
            new Error("Supabase is not configured. Add the environment variables first."),
          ),
        );
        return;
      }
      const { error: authError } = await client.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
    },
    [client],
  );

  const signOut = useCallback(async () => {
    if (!client) return;
    await client.auth.signOut();
  }, [client]);

  return {
    session,
    user: session?.user ?? null,
    loading,
    error,
    signIn,
    signOut,
  };
}
