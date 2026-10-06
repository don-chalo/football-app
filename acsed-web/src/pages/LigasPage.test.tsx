import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LigasPage } from "./LigasPage";
import type { PartidoListado } from "../api/partidos";

const base = {
  ligaId: "l1",
  localId: "e1",
  visitaId: "e2",
  fase: "fecha 1",
  idaDe: null,
  penalesLocal: null,
  penalesVisita: null,
  clasificadoId: null,
  inicioEn: null,
  pausaDesde: null,
  pausaAcumSeg: 0,
  finEn: null,
  createdBy: null,
  createdAt: null,
};

function partido(over: Partial<PartidoListado>): PartidoListado {
  return {
    ...base,
    id: "p1",
    fecha: "2026-03-01T15:00:00Z",
    estado: "programado",
    marcador: { local: 0, visita: 0 },
    ...over,
  } as PartidoListado;
}

function mockFetch(partidos: PartidoListado[]) {
  return vi.fn(async (url: unknown): Promise<Response> => {
    const u = String(url);
    if (u.endsWith("/ligas")) {
      return new Response(JSON.stringify([{ id: "l1", nombre: "Apertura", formato: "liga", idaVuelta: false }]), { status: 200 });
    }
    if (u.includes("/partidos?ligaId=l1")) {
      return new Response(JSON.stringify(partidos), { status: 200 });
    }
    if (u.endsWith("/equipos")) {
      return new Response(JSON.stringify([{ id: "e1", nombre: "Alfa" }, { id: "e2", nombre: "Beta" }]), { status: 200 });
    }
    return new Response("[]", { status: 200 });
  });
}

function renderHome() {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<LigasPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("home en vivo", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("muestra En juego ahora y Proximos sobre las ligas", async () => {
    vi.stubGlobal("fetch", mockFetch([
      partido({ id: "p1", estado: "en_juego", marcador: { local: 2, visita: 1 }, inicioEn: new Date(Date.now() - 63 * 60_000).toISOString() }),
      partido({ id: "p2", estado: "programado", fecha: "2026-04-01T15:00:00Z" }),
    ]));
    renderHome();

    expect(await screen.findByText("En juego ahora")).toBeInTheDocument();
    expect(screen.getByText("Alfa 2 - 1 Beta")).toBeInTheDocument();
    expect(screen.getByText("Próximos partidos")).toBeInTheDocument();
    expect(screen.getByText("Alfa vs Beta")).toBeInTheDocument();
    expect(screen.getByText("Ligas y copas")).toBeInTheDocument();
    expect(screen.getByText("Apertura")).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it("omite secciones vacias", async () => {
    vi.stubGlobal("fetch", mockFetch([
      partido({ id: "p2", estado: "finalizado", marcador: { local: 1, visita: 1 } }),
    ]));
    renderHome();

    expect(await screen.findByText("Ligas y copas")).toBeInTheDocument();
    expect(screen.queryByText("En juego ahora")).not.toBeInTheDocument();
    expect(screen.queryByText("Próximos partidos")).not.toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});

describe("navegacion por teclado", () => {
  it("tab alcanza los links principales", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: unknown): Promise<Response> => {
        const u = String(url);
        if (u.endsWith("/ligas")) {
          return new Response(JSON.stringify([{ id: "l1", nombre: "Apertura", formato: "liga", idaVuelta: false }]), { status: 200 });
        }
        return new Response("[]", { status: 200 });
      }),
    );
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<LigasPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Apertura")).toBeInTheDocument();
    await user.tab();
    expect(document.activeElement?.tagName).toBe("A");
    vi.unstubAllGlobals();
  });
});
