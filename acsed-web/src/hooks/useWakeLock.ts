import { useEffect, useRef, type RefObject } from "react";

/**
 * Mantiene la pantalla activa mientras `enabled` sea true.
 * Degradación graceful: si el navegador no soporta Wake Lock API
 * (iOS, Firefox, contexto inseguro) o el request es denegado, falla silencioso.
 */
export function useWakeLock(enabled: boolean): void {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!enabled) {
      try { sentinelRef.current?.release(); } catch {}
      sentinelRef.current = null;
      return;
    }

    if (!("wakeLock" in navigator)) return;

    navigator.wakeLock
      .request("screen")
      .then((sentinel) => {
        sentinelRef.current = sentinel;
      })
      .catch(() => {
        // Request denegado o sin soporte: silencioso.
      });
  }, [enabled]);

  // Soltar al ocultar pestaña, re-adquirir al volver si sigue enabled.
  useEffect(() => {
    if (!enabled || !("wakeLock" in navigator)) return;

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        sentinelRef.current?.release().catch(() => {});
        sentinelRef.current = null;
      } else if (document.visibilityState === "visible" && enabled) {
        navigator.wakeLock
          .request("screen")
          .then((sentinel) => {
            sentinelRef.current = sentinel;
          })
          .catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      try { sentinelRef.current?.release(); } catch {}
      sentinelRef.current = null;
    };
  }, [enabled]);
}
