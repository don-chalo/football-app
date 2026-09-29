import { useCallback, useEffect, useRef, useState } from "react";

export interface PollState<T> {
  data: T | null;
  error: unknown;
  loading: boolean;
  refresh: () => void;
}

/**
 * Polling con pausa cuando la pestaña está oculta.
 * Refresca de inmediato al montar y cuando se llama a `refresh()`.
 */
export function usePolling<T>(fetcher: () => Promise<T>, ms: number, activo = true): PollState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    if (!activo) {
      setLoading(false);
      return;
    }
    let vivo = true;

    const cargar = async (): Promise<void> => {
      if (document.hidden) return;
      setLoading(true);
      try {
        const r = await fetcherRef.current();
        if (!vivo) return;
        setData(r);
        setError(null);
      } catch (e) {
        if (!vivo) return;
        setError(e);
      } finally {
        if (vivo) setLoading(false);
      }
    };

    void cargar();
    const timer = setInterval(() => {
      void cargar();
    }, ms);
    return () => {
      vivo = false;
      clearInterval(timer);
    };
  }, [ms, activo, tick]);

  return { data, error, loading, refresh };
}
