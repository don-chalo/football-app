import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TablaJugadores } from "./TablaJugadores";
import type { FilaJugador } from "../api/types";

const fila: FilaJugador = {
  jugadorId: "j1", nombre: "Juan", pj: 3, pg: 2, pe: 0, pp: 1, goles: 4, autogoles: 0,
  amarillas: 1, rojas: 0, convocados: 3, ausentes: 0, inasistencia: 0, jugados: 3,
  promedioGoles: 1.3, pctGf: 1.3, pctGc: 0.7, mvp: 1, rachaGoles: 2, racha: [],
};

const encabezado = (texto: string) =>
  screen.getAllByRole("columnheader").find((h) => (h.textContent ?? "").replace(/[▲▼]/g, "").trim().startsWith(texto))!;

describe("TablaJugadores: visibilidad segun HU-EST-01", () => {
  it("visibles en tabla: Jugador, PJ, PG, PE, PP y Goles siempre; % desde sm; MVP desde md", () => {
    render(<TablaJugadores filas={[fila]} />);

    for (const c of ["Jugador", "PJ", "PG", "PE", "PP", "Goles"]) {
      expect(encabezado(c).className).not.toMatch(/\bhidden\b/);
    }
    expect(encabezado("%").className).toMatch(/hidden sm:table-cell/);
    expect(encabezado("MVP").className).toMatch(/hidden md:table-cell/);
  });

  it("ocultas siempre en tabla: Prom. goles, Racha goles, Autogoles, TA, TR, Convocado, Ausencias", () => {
    render(<TablaJugadores filas={[fila]} />);

    const encabezados = screen.getAllByRole("columnheader").map((h) => (h.textContent ?? "").replace(/[▲▼]/g, "").trim());
    for (const c of ["Prom. goles", "Racha goles", "Autogoles", "TA", "TR", "Convocado", "Ausencias"]) {
      expect(encabezados.some((e) => e.startsWith(c))).toBe(false);
    }
  });

  it("%GF y %GC son visibles desde md", () => {
    render(<TablaJugadores filas={[fila]} />);

    expect(encabezado("%GF").className).toMatch(/hidden md:table-cell/);
    expect(encabezado("%GC").className).toMatch(/hidden md:table-cell/);
  });

  it("la fila expandible contiene las columnas ocultas de la tabla", async () => {
    const user = userEvent.setup();
    render(<TablaJugadores filas={[fila]} />);
    await user.click(screen.getByRole("button", { name: "Detalle de Juan" }));

    const expansion = screen.getByText(/AG 0/).closest("td") as HTMLElement;
    const txt = expansion.textContent ?? "";
    for (const etiqueta of ["% Rendimiento", "MVP", "Prom. goles", "Racha goles", "%GF", "%GC", "AG", "TA", "TR", "Conv", "Aus"]) {
      expect(txt).toContain(etiqueta);
    }
  });
});
