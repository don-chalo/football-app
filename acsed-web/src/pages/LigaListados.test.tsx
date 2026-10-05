import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SessionProvider } from "../auth/Session";
import { RequireAdmin } from "../auth/guards";
import { LigaDetailPage } from "./LigaDetailPage";
import { LigaManagePage } from "./LigaManagePage";

const partido = {
  id: "p1",
  ligaId: "l1",
  localId: "e1",
  visitaId: "e2",
  fecha: "2026-03-01T15:00:00Z",
  estado: "finalizado",
  fase: "fecha 1",
  penalesLocal: null,
  penalesVisita: null,
  clasificadoId: null,
  marcador: { local: 2, visita: 1 },
};

function mockFetch(formato: "liga" | "copa") {
  return vi.fn(async (url: unknown): Promise<Response> => {
    const u = String(url);
    if (u.endsWith("/ligas/l1")) {
      return new Response(
        JSON.stringify({ id: "l1", nombre: "Apertura", formato, idaVuelta: false, createdBy: null, createdAt: null }),
        { status: 200 },
      );
    }
    if (u.includes("/partidos?ligaId=l1")) {
      return new Response(JSON.stringify([partido]), { status: 200 });
    }
    if (u.endsWith("/equipos")) {
      return new Response(
        JSON.stringify([
          { id: "e1", nombre: "Alfa" },
          { id: "e2", nombre: "Beta" },
        ]),
        { status: 200 },
      );
    }
    return new Response("[]", { status: 200 });
  });
}

function urls(mock: ReturnType<typeof vi.fn>): string[] {
  return mock.mock.calls.map(([url]) => String(url));
}

function sinDetalle(mock: ReturnType<typeof vi.fn>): void {
  expect(urls(mock).some((u) => /\/partidos\/p1(?:[/?#]|$)/.test(u))).toBe(false);
}

function textoCard(equipo: string, indice = 0): string {
  const el = screen.getAllByText(equipo)[indice] as HTMLElement;
  return el.closest("div.flex.items-start")?.textContent ?? "";
}

describe("resultado en listados", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("lista pública muestra el marcador sin abrir el detalle", async () => {
    const fetchMock = mockFetch("liga");
    vi.stubGlobal("fetch", fetchMock);
    render(
      <MemoryRouter initialEntries={["/ligas/l1"]}>
        <SessionProvider>
          <Routes>
            <Route path="/ligas/:id" element={<LigaDetailPage />} />
          </Routes>
        </SessionProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Alfa")).toBeInTheDocument();
    expect(textoCard("Alfa")).toContain("2");
    expect(textoCard("Alfa")).toContain("1");
    expect(screen.getByText("Alfa").closest("div.flex.items-start")).not.toBeNull();
    sinDetalle(fetchMock);
    vi.unstubAllGlobals();
  });

  it("llaves de copa muestran el marcador sin abrir el detalle", async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch("copa");
    vi.stubGlobal("fetch", fetchMock);
    render(
      <MemoryRouter initialEntries={["/ligas/l1"]}>
        <SessionProvider>
          <Routes>
            <Route path="/ligas/:id" element={<LigaDetailPage />} />
          </Routes>
        </SessionProvider>
      </MemoryRouter>,
    );

    await user.click(await screen.findByText("Llaves"));
    expect(await screen.findByText("Alfa 2 - 1 Beta")).toBeInTheDocument();
    sinDetalle(fetchMock);
    vi.unstubAllGlobals();
  });

  it("lista administrativa muestra el marcador sin abrir el workspace", async () => {
    localStorage.setItem("acsed.token", "t");
    localStorage.setItem("acsed.user", JSON.stringify({ id: "1", username: "plan", role: "admin_partidos" }));
    localStorage.setItem("acsed.misLigas", JSON.stringify(["l1"]));
    const fetchMock = mockFetch("liga");
    vi.stubGlobal("fetch", fetchMock);
    render(
      <MemoryRouter initialEntries={["/admin/ligas/l1"]}>
        <SessionProvider>
          <Routes>
            <Route path="/admin/ligas/:id" element={<RequireAdmin><LigaManagePage /></RequireAdmin>} />
          </Routes>
        </SessionProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Alfa")).toBeInTheDocument();
    expect(textoCard("Alfa")).toContain("2");
    expect(textoCard("Alfa")).toContain("1");
    expect(screen.getByText("Alfa").closest("div.flex.items-start")).not.toBeNull();
    sinDetalle(fetchMock);
    vi.unstubAllGlobals();
  });
});

describe("partido suspendido", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("lista atenuada con badge neutro", async () => {
    const fetchMock = vi.fn(async (url: unknown): Promise<Response> => {
      const u = String(url);
      if (u.endsWith("/ligas/l1")) {
        return new Response(JSON.stringify({ id: "l1", nombre: "Apertura", formato: "liga", idaVuelta: false, createdBy: null, createdAt: null }), { status: 200 });
      }
      if (u.includes("/partidos?ligaId=l1")) {
        return new Response(JSON.stringify([{ ...partido, estado: "suspendido" }]), { status: 200 });
      }
      if (u.endsWith("/equipos")) {
        return new Response(JSON.stringify([{ id: "e1", nombre: "Alfa" }, { id: "e2", nombre: "Beta" }]), { status: 200 });
      }
      return new Response("[]", { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);
    render(
      <MemoryRouter initialEntries={["/ligas/l1"]}>
        <SessionProvider>
          <Routes>
            <Route path="/ligas/:id" element={<LigaDetailPage />} />
          </Routes>
        </SessionProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByText("suspendido")).toBeInTheDocument();
    expect(screen.getByText("Alfa").closest(".opacity-60")).not.toBeNull();
    expect(textoCard("Alfa")).toContain("2");
    vi.unstubAllGlobals();
  });
});

describe("filtro por estado en fixture", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("chips filtran manteniendo orden por fecha", async () => {
    const user = userEvent.setup();
    const base = { ligaId: "l1", fase: "fecha 1", idaDe: null, penalesLocal: null, penalesVisita: null, clasificadoId: null, inicioEn: null, pausaDesde: null, pausaAcumSeg: 0, finEn: null, createdBy: null, createdAt: null };
    const fetchMock = vi.fn(async (url: unknown): Promise<Response> => {
      const u = String(url);
      if (u.endsWith("/ligas/l1")) {
        return new Response(JSON.stringify({ id: "l1", nombre: "Apertura", formato: "liga", idaVuelta: false, createdBy: null, createdAt: null }), { status: 200 });
      }
      if (u.includes("/partidos?ligaId=l1")) {
        return new Response(JSON.stringify([
          { ...base, id: "p1", localId: "e1", visitaId: "e2", fecha: "2026-03-01T15:00:00Z", estado: "en_juego", marcador: { local: 1, visita: 0 } },
          { ...base, id: "p2", localId: "e1", visitaId: "e2", fecha: "2026-04-01T15:00:00Z", estado: "programado", marcador: { local: 0, visita: 0 } },
        ]), { status: 200 });
      }
      if (u.endsWith("/equipos")) {
        return new Response(JSON.stringify([{ id: "e1", nombre: "Alfa" }, { id: "e2", nombre: "Beta" }]), { status: 200 });
      }
      return new Response("[]", { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);
    render(
      <MemoryRouter initialEntries={["/ligas/l1"]}>
        <SessionProvider>
          <Routes>
            <Route path="/ligas/:id" element={<LigaDetailPage />} />
          </Routes>
        </SessionProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByText(/^Todos 2$/)).toBeInTheDocument();
    expect(screen.getByText(/^En juego 1$/)).toBeInTheDocument();
    expect(screen.getAllByText("Alfa")).toHaveLength(2);
    expect(textoCard("Alfa", 0)).toContain("0");
    expect(textoCard("Alfa", 1)).toContain("1");
    await user.click(screen.getByText(/^En juego 1$/));
    expect(textoCard("Alfa", 0)).toContain("1");
    expect(screen.queryAllByText("Alfa")).toHaveLength(1);
    await user.click(screen.getByText(/^Todos 2$/));
    expect(screen.getAllByText("Alfa")).toHaveLength(2);
    vi.unstubAllGlobals();
  });
});

describe("empty con accion", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  function mockVacio() {
    return vi.fn(async (url: unknown): Promise<Response> => {
      const u = String(url);
      if (u.endsWith("/ligas/l1")) {
        return new Response(JSON.stringify({ id: "l1", nombre: "Apertura", formato: "liga", idaVuelta: false, createdBy: null, createdAt: null }), { status: 200 });
      }
      if (u.endsWith("/equipos")) {
        return new Response(JSON.stringify([]), { status: 200 });
      }
      return new Response("[]", { status: 200 });
    });
  }

  function renderLiga() {
    render(
      <MemoryRouter initialEntries={["/ligas/l1"]}>
        <SessionProvider>
          <Routes>
            <Route path="/ligas/:id" element={<LigaDetailPage />} />
          </Routes>
        </SessionProvider>
      </MemoryRouter>,
    );
  }

  it("admin ve crear partido en fixture vacio", async () => {
    localStorage.setItem("acsed.token", "t");
    localStorage.setItem("acsed.user", JSON.stringify({ id: "1", username: "plan", role: "admin_partidos" }));
    localStorage.setItem("acsed.misLigas", JSON.stringify(["l1"]));
    vi.stubGlobal("fetch", mockVacio());
    render(
      <MemoryRouter initialEntries={["/ligas/l1"]}>
        <SessionProvider>
          <Routes>
            <Route path="/ligas/:id" element={<LigaDetailPage />} />
          </Routes>
        </SessionProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Sin partidos.")).toBeInTheDocument();
    expect(screen.getByText("+ Nuevo partido")).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it("visitante no ve accion en fixture vacio", async () => {
    vi.stubGlobal("fetch", mockVacio());
    renderLiga();

    expect(await screen.findByText("Sin partidos.")).toBeInTheDocument();
    expect(screen.queryByText("+ Nuevo partido")).not.toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});
