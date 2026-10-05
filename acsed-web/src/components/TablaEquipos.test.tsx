import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TablaEquipos } from "./TablaEquipos";
import type { FilaEquipo } from "../api/types";

const fila: FilaEquipo = {
  equipoId: "e1", nombre: "Alfa", pj: 5, pg: 3, pe: 1, pp: 1, gf: 10, gc: 4, dif: 6, pts: 10,
};

function renderTabla() {
  return render(
    <TablaEquipos
      filas={[fila]}
      orden={{ orden: { key: null, dir: "desc" }, alternar: vi.fn() }}
      nombreDe={(f) => f.nombre}
    />,
  );
}

describe("TablaEquipos responsive", () => {
  it("muestra DIF y expande detalle al tap", async () => {
    const user = userEvent.setup();
    renderTabla();

    expect(screen.getByText("DIF")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.queryByText(/PG 3 · PE 1/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Detalle de Alfa" }));
    expect(screen.getByText("PG 3 · PE 1 · PP 1 · GF 10 · GC 4")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Detalle de Alfa" }));
    expect(screen.queryByText(/PG 3 · PE 1/)).not.toBeInTheDocument();
  });
});
