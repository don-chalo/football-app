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
        <Routes>
          <Route path="/ligas/:id" element={<LigaDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Alfa 2 - 1 Beta")).toBeInTheDocument();
    expect(screen.getByText("Alfa 2 - 1 Beta").closest("div")?.className).toContain("flex-wrap");
    sinDetalle(fetchMock);
    vi.unstubAllGlobals();
  });

  it("llaves de copa muestran el marcador sin abrir el detalle", async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch("copa");
    vi.stubGlobal("fetch", fetchMock);
    render(
      <MemoryRouter initialEntries={["/ligas/l1"]}>
        <Routes>
          <Route path="/ligas/:id" element={<LigaDetailPage />} />
        </Routes>
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

    expect(await screen.findByText("Alfa 2 - 1 Beta")).toBeInTheDocument();
    expect(screen.getByText("Alfa 2 - 1 Beta").closest("div")?.className).toContain("flex-wrap");
    sinDetalle(fetchMock);
    vi.unstubAllGlobals();
  });
});
