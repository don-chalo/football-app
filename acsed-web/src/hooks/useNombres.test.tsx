import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useMapaEquipos, useMapaJugadores } from "./useNombres";

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
