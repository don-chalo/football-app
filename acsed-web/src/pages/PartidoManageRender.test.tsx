import { act, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PartidoManagePage } from "./PartidoManagePage";

vi.mock("../components/CargaVivo", () => {
  let renders = 0;
  return {
    CargaVivo: () => {
      renders += 1;
      return <div data-testid="carga" data-renders={renders} />;
    },
  };
});

const detalle = {
  id: "p1",
  ligaId: "l1",
  localId: "e1",
  visitaId: "e2",
  fecha: "2026-03-01T15:00:00Z",
  estado: "en_juego",
  fase: "fecha 1",
  idaDe: null,
  penalesLocal: null,
  penalesVisita: null,
  clasificadoId: null,
  inicioEn: new Date(Date.now() - 63 * 60_000).toISOString(),
  pausaDesde: null,
  pausaAcumSeg: 0,
  finEn: null,
  createdBy: null,
  createdAt: null,
  marcador: { local: 1, visita: 0 },
  convocatorias: [],
  eventos: [],
};

describe("tick del reloj aislado", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("la pagina no re-renderiza cada segundo", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: unknown): Promise<Response> => {
        const u = String(url);
        if (u.endsWith("/partidos/p1")) return new Response(JSON.stringify(detalle), { status: 200 });
        return new Response("[]", { status: 200 });
      }),
    );
    render(
      <MemoryRouter initialEntries={["/admin/partidos/p1"]}>
        <Routes>
          <Route path="/admin/partidos/:id" element={<PartidoManagePage />} />
        </Routes>
      </MemoryRouter>,
    );

    for (let i = 0; i < 5; i += 1) {
      await act(async () => {
        await Promise.resolve();
      });
    }
    expect(screen.getByTestId("carga")).toBeInTheDocument();
    expect(screen.getByTestId("carga").getAttribute("data-renders")).toBe("1");

    await act(async () => {
      vi.advanceTimersByTime(2500);
    });
    expect(screen.getByTestId("carga").getAttribute("data-renders")).toBe("1");
  });
});
