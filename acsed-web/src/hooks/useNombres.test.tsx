import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useMapaEquipos, useMapaJugadores, useNombresPorIds } from "./useNombres";

function SoloEquipos() {
  const mapa = useMapaEquipos();
  return <div data-testid="n">{mapa.size}</div>;
}

function SoloJugadores() {
  const mapa = useMapaJugadores();
  return <div data-testid="n">{mapa.size}</div>;
}

function urls(mock: ReturnType<typeof vi.fn>): string[] {
  return mock.mock.calls.map(([url]) => String(url));
}

describe("hooks separados", () => {
  it("useMapaEquipos solo pide /equipos", async () => {
    const fetchMock = vi.fn(async () => new Response("[]", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    render(<SoloEquipos />);
    await waitFor(() => {
      expect(urls(fetchMock).some((u) => u.endsWith("/equipos"))).toBe(true);
    });
    expect(screen.getByTestId("n")).toBeInTheDocument();
    expect(urls(fetchMock).some((u) => u.endsWith("/jugadores"))).toBe(false);
    vi.unstubAllGlobals();
  });

  it("useMapaJugadores solo pide /jugadores", async () => {
    const fetchMock = vi.fn(async () => new Response("[]", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    render(<SoloJugadores />);
    await waitFor(() => {
      expect(urls(fetchMock).some((u) => u.endsWith("/jugadores"))).toBe(true);
    });
    expect(urls(fetchMock).some((u) => u.endsWith("/equipos"))).toBe(false);
    vi.unstubAllGlobals();
  });
});

describe("useNombresPorIds", () => {
  it("pide una vez por conjunto de ids (orden y duplicados no cuentan)", async () => {
    const buscar = vi.fn(async (ids: string[]) => ids.map((id) => ({ id, nombre: `N-${id}` })));
    const { result, rerender } = renderHook(({ ids }) => useNombresPorIds(ids, buscar), {
      initialProps: { ids: ["b", "a"] },
    });
    await waitFor(() => expect(result.current.mapa).not.toBeNull());
    expect(result.current.mapa?.get("a")).toBe("N-a");
    expect(buscar).toHaveBeenCalledWith(["a", "b"]);

    rerender({ ids: ["a", "b", "a"] });
    expect(buscar).toHaveBeenCalledTimes(1);

    rerender({ ids: ["a", "b", "c"] });
    await waitFor(() => expect(buscar).toHaveBeenCalledTimes(2));
    expect(buscar).toHaveBeenLastCalledWith(["a", "b", "c"]);
  });

  it("sin ids no pide y devuelve mapa vacio", async () => {
    const buscar = vi.fn(async () => []);
    const { result } = renderHook(() => useNombresPorIds([], buscar));
    await waitFor(() => expect(result.current.mapa).not.toBeNull());
    expect(result.current.mapa?.size).toBe(0);
    expect(buscar).not.toHaveBeenCalled();
  });

  it("expone error y refresh reintenta", async () => {
    const buscar = vi
      .fn<(ids: string[]) => Promise<{ id: string; nombre: string }[]>>()
      .mockRejectedValueOnce(new Error("caido"))
      .mockResolvedValueOnce([{ id: "a", nombre: "Ana" }]);
    const { result } = renderHook(() => useNombresPorIds(["a"], buscar));
    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.mapa).toBeNull();

    act(() => result.current.refresh());
    await waitFor(() => expect(result.current.mapa?.get("a")).toBe("Ana"));
    expect(result.current.error).toBeNull();
  });
});
