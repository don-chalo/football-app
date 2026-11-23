import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TablaJugadores } from "./TablaJugadores";
import type { FilaJugador } from "../api/types";

const fila: FilaJugador = {
  jugadorId: "j1", nombre: "Juan", pj: 3, pg: 2, pe: 0, pp: 1,
  goles: 4, autogoles: 0, amarillas: 1, rojas: 0,
  convocados: 3, ausentes: 0, inasistencia: 0, jugados: 3, promedioGoles: null, pctGf: null, pctGc: null, mvp: 0, rachaGoles: 0, racha: [],
};

describe("TablaJugadores responsive", () => {
  it("muestra Goles y expande detalle al tap", async () => {
    const user = userEvent.setup();
    render(<TablaJugadores filas={[fila]} />);

    expect(within(screen.getByRole("table")).getByText("Goles")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.queryByText(/AG 0/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Detalle de Juan" }));
    const expansion = screen.getByText(/AG 0/).closest("td") as HTMLElement;
    expect(expansion.textContent).toContain("66.7");
    expect(expansion.textContent).toContain("AG 0");
    expect(expansion.textContent).toContain("TA 1");
    expect(expansion.textContent).toContain("TR 0");
    expect(expansion.textContent).toContain("Conv 3");
    expect(expansion.textContent).toContain("Aus 0");

    await user.click(screen.getByRole("button", { name: "Detalle de Juan" }));
    expect(screen.queryByText(/AG 0/)).not.toBeInTheDocument();
  });
});
