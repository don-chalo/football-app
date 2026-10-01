import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PartidoPage } from "./PartidoPage";
import type { PartidoDetalle } from "../api/types";

function detalle(convocatorias: PartidoDetalle["convocatorias"]): PartidoDetalle {
  return {
    id: "p1",
    ligaId: "l1",
    localId: "e1",
    visitaId: "e2",
    fecha: "2026-03-01T15:00:00Z",
    estado: "en_juego",
    fase: "",
    idaDe: null,
    penalesLocal: null,
    penalesVisita: null,
    clasificadoId: null,
    createdBy: null,
    createdAt: null,
    marcador: { local: 0, visita: 0 },
    convocatorias,
    eventos: [],
  };
}

function convocatoria(id: string, jugadorId: string, equipoId: string, estado: "convocado" | "ausente"): PartidoDetalle["convocatorias"][number] {
  return { id, partidoId: "p1", jugadorId, equipoId, estado, createdBy: null, createdAt: null };
}

function mockFetch(det: PartidoDetalle) {
  return vi.fn(async (url: unknown): Promise<Response> => {
    const u = String(url);
    if (u.includes("/partidos/p1")) return new Response(JSON.stringify(det), { status: 200 });
    if (u.endsWith("/equipos")) {
      return new Response(JSON.stringify([{ id: "e1", nombre: "Alfa" }, { id: "e2", nombre: "Beta" }]), { status: 200 });
    }
    if (u.endsWith("/jugadores")) {
      return new Response(
        JSON.stringify([
          { id: "j1", nombre: "Juan" },
          { id: "j2", nombre: "Pedro" },
          { id: "j3", nombre: "Luis" },
        ]),
        { status: 200 },
      );
    }
    return new Response("[]", { status: 200 });
  });
}

function renderDetalle() {
  render(
    <MemoryRouter initialEntries={["/partidos/p1"]}>
      <Routes>
        <Route path="/partidos/:id" element={<PartidoPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("convocatoria en detalle", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("muestra columnas local y visitante sobre Goleadores", async () => {
    vi.stubGlobal("fetch", mockFetch(detalle([
      convocatoria("c1", "j1", "e1", "convocado"),
      convocatoria("c2", "j2", "e2", "convocado"),
    ])));
    renderDetalle();

    expect(await screen.findByText("Convocatoria")).toBeInTheDocument();
    expect(screen.getByText("Alfa")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText("Juan")).toBeInTheDocument();
    expect(screen.getByText("Pedro")).toBeInTheDocument();
    expect(screen.getByText("Convocatoria").compareDocumentPosition(screen.getByText("Goleadores"))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(
      screen.getByText("Convocatoria").closest("div")?.querySelector(".grid.grid-cols-2"),
    ).not.toBeNull();
    vi.unstubAllGlobals();
  });

  it("mantiene ausentes visibles, atenuados y marcados", async () => {
    vi.stubGlobal("fetch", mockFetch(detalle([
      convocatoria("c1", "j1", "e1", "convocado"),
      convocatoria("c3", "j3", "e1", "ausente"),
    ])));
    renderDetalle();

    expect(await screen.findByText("Luis")).toBeInTheDocument();
    expect(screen.getByText("(ausente)")).toBeInTheDocument();
    expect(screen.getByText("Luis").closest("li")?.className).toContain("text-stone-400");
    vi.unstubAllGlobals();
  });

  it("muestra estados vacíos por partido y por equipo", async () => {
    vi.stubGlobal("fetch", mockFetch(detalle([])));
    renderDetalle();
    expect(await screen.findByText("Sin convocatoria cargada.")).toBeInTheDocument();
    vi.unstubAllGlobals();

    vi.stubGlobal("fetch", mockFetch(detalle([convocatoria("c1", "j1", "e1", "convocado")])));
    renderDetalle();
    expect(await screen.findByText("Juan")).toBeInTheDocument();
    expect(screen.getByText("Sin jugadores.")).toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});
