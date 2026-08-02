/**
 * Base async primitives for the hooks layer.
 * Feature hooks compose these to expose { data, loading, error, refetch, setData }
 * and a standalone mutation runner.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { toAppError } from "@/lib/errors";
import type { AppError } from "@/lib/errors";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: AppError | null;
}

export interface AsyncResult<T> extends AsyncState<T> {
  refetch: () => Promise<void>;
  setData: (data: T | null) => void;
}

/**
 * Runs `fn` whenever `deps` change. Safe against the unconfigured mode:
 * pass `enabled=false` (e.g. no client / no store) to keep data null without
 * fetching.
 */
export function useAsync<T>(
  fn: () => Promise<T>,
  deps: unknown[],
  enabled = true,
): AsyncResult<T> {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: enabled,
    error: null,
  });

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(async () => {
    if (!enabled) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fnRef.current();
      if (mounted.current) setState({ data, loading: false, error: null });
    } catch (error) {
      if (mounted.current) setState({ data: null, loading: false, error: toAppError(error) });
    }
  }, [enabled]);

  useEffect(() => {
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const setData = useCallback((data: T | null) => {
    setState({ data, loading: false, error: null });
  }, []);

  return { ...state, refetch: run, setData };
}

export interface MutationResult<TArgs extends unknown[], TResult> {
  run: (...args: TArgs) => Promise<TResult>;
  pending: boolean;
  error: AppError | null;
}

/** Wraps an async mutation (create/update/delete) with pending + error state. */
export function useMutation<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
): MutationResult<TArgs, TResult> {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const run = useCallback(async (...args: TArgs): Promise<TResult> => {
    setPending(true);
    setError(null);
    try {
      return await fnRef.current(...args);
    } catch (err) {
      setError(toAppError(err));
      throw err;
    } finally {
      setPending(false);
    }
  }, []);

  return { run, pending, error };
}
