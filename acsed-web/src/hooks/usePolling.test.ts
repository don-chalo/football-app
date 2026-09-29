import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { usePolling } from "./usePolling";

describe("usePolling", () => {
  it("carga al montar y refresca manualmente", async () => {
    let n = 0;
    const fetcher = vi.fn(async () => {
      n += 1;
      return n;
    });
    const { result } = renderHook(() => usePolling(fetcher, 60_000));
    await waitFor(() => expect(result.current.data).toBe(1));
    result.current.refresh();
    await waitFor(() => expect(result.current.data).toBe(2));
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("repite cada intervalo", async () => {
    const fetcher = vi.fn(async () => "x");
    renderHook(() => usePolling(fetcher, 20));
    await waitFor(() => expect(fetcher.mock.calls.length).toBeGreaterThanOrEqual(3), { timeout: 2000 });
  });

  it("propaga el error sin romper", async () => {
    const fetcher = vi.fn(async (): Promise<string> => {
      throw new Error("caido");
    });
    const { result } = renderHook(() => usePolling(fetcher, 60_000));
    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.loading).toBe(false);
  });
});
