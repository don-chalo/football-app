import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { EstadisticasPage } from "./EstadisticasPage";
import type { FilaJugador } from "../api/types";

const juan: FilaJugador = {
  jugadorId: "j1", nombre: "Juan", pj: 3, pg: 2, pe: 0, pp: 1,
  goles: 4, autogoles: 0, amarillas: 1, rojas: 0, convocados: 3, ausentes: 0, inasistencia: 0, jugados: 3,
};
const pedro: FilaJugador = {
  jugadorId: "j2", nombre: "Pedro", pj: 3, pg: 1, pe: 1, pp: 1,
  goles: 1, autogoles: 0, amarillas: 0, rojas: 1, convocados: 3, ausentes: 0, inasistencia: 0, jugados: 3,
};

function mockFetch() {
  return vi.fn(async (url: unknown): Promise<Response> => {
    const u = String(url);
    if (u.includes("/estadisticas/jugadores")) {
      return new Response(JSON.stringify([juan, pedro]), { status: 200 });
    }
    return new Response("[]", { status: 200 });
  });
}

describe("EstadisticasPage jugadores", () => {
  it("muestra % a la derecha de PP y ordena por rendimiento", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", mockFetch());
    render(
      <MemoryRouter initialEntries={["/estadisticas/equipos"]}>
        <Routes>
          <Route path="/estadisticas/:tab" element={<EstadisticasPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByText("Jugadores"));
    expect(await screen.findByText("66.7")).toBeInTheDocument();
    expect(screen.getByText("44.4")).toBeInTheDocument();

    const filaJuan = screen.getByText("Juan").closest("tr") as HTMLElement;
    const celdas = [...filaJuan.querySelectorAll("td")].map((td) => td.textContent);
    expect(celdas).toMatchObject(["Juan", "3", "2", "0", "1", "66.7", "4", "0", "1", "0", "3", "0"]);

    await user.click(screen.getAllByTitle("% de rendimiento")[0] as HTMLElement);
    const nombres = screen.getAllByText(/^(Juan|Pedro)$/).map((e) => e.textContent);
    expect(nombres[0]).toBe("Juan");
    vi.unstubAllGlobals();
  });

  it("muestra columnas TA y TR con los conteos", async () => {
    vi.stubGlobal("fetch", mockFetch());
    render(
      <MemoryRouter initialEntries={["/estadisticas/equipos"]}>
        <Routes>
          <Route path="/estadisticas/:tab" element={<EstadisticasPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    await user.click(screen.getByText("Jugadores"));
    expect(await screen.findByText("TA")).toBeInTheDocument();
    expect(screen.getByText("TR")).toBeInTheDocument();
    const filaJuan = screen.getByText("Juan").closest("tr") as HTMLElement;
    const celdas = [...filaJuan.querySelectorAll("td")].map((td) => td.textContent);
    expect(celdas).toMatchObject(["Juan", "3", "2", "0", "1", "66.7", "4", "0", "1", "0", "3", "0"]);
    vi.unstubAllGlobals();
  });

  it("carga directa de /duelo muestra el duelo sin clicks", async () => {
    vi.stubGlobal("fetch", mockFetch());
    render(
      <MemoryRouter initialEntries={["/estadisticas/duelo"]}>
        <Routes>
          <Route path="/estadisticas/:tab" element={<EstadisticasPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Ver duelo")).toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});
