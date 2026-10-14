import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TablaJugadores } from "./TablaJugadores";
import type { FilaJugador } from "../api/types";

const fila: FilaJugador = {
  jugadorId: "j1", nombre: "Juan", pj: 3, pg: 2, pe: 0, pp: 1,
  goles: 4, autogoles: 0, amarillas: 1, rojas: 0,
  convocados: 3, ausentes: 0, inasistencia: 0, jugados: 3,
};

describe("TablaJugadores responsive", () => {
  it("muestra Goles y expande detalle al tap", async () => {
    const user = userEvent.setup();
    render(<TablaJugadores filas={[fila]} />);

    expect(screen.getByText("Goles")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.queryByText(/AG 0 · TA 1/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Detalle de Juan" }));
    expect(screen.getByText(/% 66\.7/)).toBeInTheDocument();
    expect(screen.getByText(/AG 0 · TA 1 · TR 0 · Conv 3 · Aus 0/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Detalle de Juan" }));
    expect(screen.queryByText(/AG 0 · TA 1/)).not.toBeInTheDocument();
  });
});
