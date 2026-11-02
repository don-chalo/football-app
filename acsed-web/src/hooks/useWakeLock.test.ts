import { describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWakeLock } from "./useWakeLock";

describe("useWakeLock", () => {
  it("no lanza cuando navigator.wakeLock no existe", () => {
    const originalWakeLock = (navigator as any).wakeLock;
    try {
      delete (navigator as any).wakeLock;
      const { unmount } = renderHook(() => useWakeLock(true));
      expect(() => unmount()).not.toThrow();
    } finally {
      (navigator as any).wakeLock = originalWakeLock;
    }
  });

  it("no lanza al alternar enabled sin wakeLock", () => {
    const originalWakeLock = (navigator as any).wakeLock;
    try {
      delete (navigator as any).wakeLock;
      const { rerender } = renderHook(({ enabled }) => useWakeLock(enabled), { initialProps: { enabled: true } });
      rerender({ enabled: false });
      rerender({ enabled: true });
      expect(() => rerender({ enabled: false })).not.toThrow();
    } finally {
      (navigator as any).wakeLock = originalWakeLock;
    }
  });

  it("adquiere y libera sentinel cuando wakeLock está disponible", async () => {
    const originalWakeLock = (navigator as any).wakeLock;
    try {
      let sentinel: any = null;
      (navigator as any).wakeLock = {
        request: () => {
          sentinel = { release: () => { sentinel = null; } };
          return Promise.resolve(sentinel);
        },
      } as any;

      const { rerender, unmount } = renderHook(({ enabled }) => useWakeLock(enabled), { initialProps: { enabled: false } });

      // Habilitar -> adquiere (esperar a que el efecto se ejecute)
      rerender({ enabled: true });
      await act(async () => {});
      expect(sentinel).not.toBeNull();

      // Deshabilitar -> libera
      rerender({ enabled: false });
      await act(async () => {});
      expect(sentinel).toBeNull();

      // Unmount con enabled true -> libera
      const { unmount: unmount2 } = renderHook(({ enabled }) => useWakeLock(enabled), { initialProps: { enabled: true } });
      await act(async () => {});
      expect(sentinel).not.toBeNull();
      unmount2();
      await act(async () => {});
      expect(sentinel).toBeNull();

      unmount();
    } finally {
      (navigator as any).wakeLock = originalWakeLock;
    }
  });
});
