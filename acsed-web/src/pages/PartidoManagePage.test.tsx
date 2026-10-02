import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PartidoManagePage } from "./PartidoManagePage";
import type { PartidoDetalle } from "../api/types";

const detalle: PartidoDetalle = {
  id: "p1",
  ligaId: "l1",
  localId: "e1",
  visitaId: "e2",
  fecha: "2026-03-01T15:00:00Z",
  estado: "programado",
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
  marcador: { local: 0, visita: 0 },
  convocatorias: [
    { id: "c1", partidoId: "p1", jugadorId: "j1", equipoId: "e1", estado: "convocado", createdBy: null, createdAt: null },
  ],
  eventos: [],
};

function mockFetch() {
  return vi.fn(async (url: unknown): Promise<Response> => {
    const u = String(url);
    if (u.endsWith("/partidos/p1")) return new Response(JSON.stringify(detalle), { status: 200 });
    if (u.endsWith("/equipos")) {
      return new Response(
        JSON.stringify([
          { id: "e1", nombre: "Alfa" },
          { id: "e2", nombre: "Beta" },
        ]),
        { status: 200 },
      );
    }
    if (u.endsWith("/jugadores")) {
      return new Response(JSON.stringify([{ id: "j1", nombre: "Juan" }]), { status: 200 });
    }
    return new Response("[]", { status: 200 });
  });
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/admin/partidos/p1"]}>
      <Routes>
        <Route path="/admin/partidos/:id" element={<PartidoManagePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("convocatoria unificada", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("lista unica visible en programado sin tarjeta Convocados", async () => {
    vi.stubGlobal("fetch", mockFetch());
    renderPage();

    expect(await screen.findByText("Convocatoria y goles")).toBeInTheDocument();
    expect(screen.queryByText("Convocados")).not.toBeInTheDocument();
    expect(screen.queryByText("Cargar goles")).not.toBeInTheDocument();
    expect(screen.getByText("Juan")).toBeInTheDocument();
    expect(screen.getAllByText("+ Agregar jugador")).toHaveLength(2);
    vi.unstubAllGlobals();
  });

  it("sheet en programado no ofrece goles", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", mockFetch());
    renderPage();

    await user.click(await screen.findByText("Juan"));
    expect(await screen.findByText("Ausente")).toBeInTheDocument();
    expect(screen.getByText("Quitar")).toBeInTheDocument();
    expect(screen.queryByText("GOL")).not.toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});

describe("cronometro en gestion", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  function mockEnJuego() {
    return vi.fn(async (url: unknown, init?: RequestInit): Promise<Response> => {
      const u = String(url);
      if ((init?.method ?? "GET") === "POST" && u.endsWith("/pausa")) {
        return new Response(JSON.stringify({ id: "p1" }), { status: 200 });
      }
      if (u.endsWith("/partidos/p1")) {
        return new Response(JSON.stringify({
          ...detalle,
          estado: "en_juego",
          inicioEn: new Date(Date.now() - 65 * 60_000).toISOString(),
        }), { status: 200 });
      }
      if (u.endsWith("/equipos")) {
        return new Response(JSON.stringify([{ id: "e1", nombre: "Alfa" }, { id: "e2", nombre: "Beta" }]), { status: 200 });
      }
      if (u.endsWith("/jugadores")) {
        return new Response(JSON.stringify([{ id: "j1", nombre: "Juan" }]), { status: 200 });
      }
      return new Response("[]", { status: 200 });
    });
  }

  it("boton deshabilitado con aviso antes de la fecha", async () => {
    const futura = new Date(Date.now() + 3_600_000).toISOString();
    const fetchMock = vi.fn(async (url: unknown): Promise<Response> => {
      const u = String(url);
      if (u.endsWith("/partidos/p1")) return new Response(JSON.stringify({ ...detalle, fecha: futura }), { status: 200 });
      if (u.endsWith("/equipos")) {
        return new Response(JSON.stringify([{ id: "e1", nombre: "Alfa" }, { id: "e2", nombre: "Beta" }]), { status: 200 });
      }
      if (u.endsWith("/jugadores")) {
        return new Response(JSON.stringify([{ id: "j1", nombre: "Juan" }]), { status: 200 });
      }
      return new Response("[]", { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);
    renderPage();

    const btn = await screen.findByText("Poner en juego");
    expect(btn.closest("button")).toBeDisabled();
    expect(screen.getByText(/Disponible desde/)).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it("card visible en juego con pausar y POST pausa", async () => {
    const user = userEvent.setup();
    const fetchMock = mockEnJuego();
    vi.stubGlobal("fetch", fetchMock);
    renderPage();

    expect(await screen.findByText("EN JUEGO")).toBeInTheDocument();
    expect(screen.getByText("Pausar")).toBeInTheDocument();
    await user.click(screen.getByText("Pausar"));

    await screen.findByText("EN JUEGO");
    const post = fetchMock.mock.calls.find(([u, i]) => String(u).endsWith("/pausa") && (i as RequestInit).method === "POST");
    expect(post).toBeDefined();
    expect(JSON.parse(((post as unknown[])[1] as RequestInit).body as string) as unknown).toMatchObject({ pausada: true });
    vi.unstubAllGlobals();
  });
});
