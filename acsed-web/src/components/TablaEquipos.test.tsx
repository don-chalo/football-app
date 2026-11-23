import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TablaEquipos } from "./TablaEquipos";
import type { FilaEquipo } from "../api/types";

const fila: FilaEquipo = {
  equipoId: "e1", nombre: "Alfa", pj: 5, pg: 3, pe: 1, pp: 1, gf: 10, gc: 4, dif: 6, pts: 10, pctGf: null, pctGc: null, racha: [],
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

    expect(within(screen.getByRole("table")).getByText("DIF")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.queryByText(/PG 3 · PE 1/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Detalle de Alfa" }));
    const expansion = document.querySelector("td[colspan='5']") as HTMLElement;
    expect(expansion.textContent?.replace(/s+/g, " ").trim()).toBe("PG 3 · PE 1 · PP 1 · GF 10 · GC 4".replace(/ · /g, " ·"));

    await user.click(screen.getByRole("button", { name: "Detalle de Alfa" }));
    expect(document.querySelector("td[colspan='5']")).toBeNull();
  });

  it("muestra % y ordena por rendimiento", async () => {
    const user = userEvent.setup();
    const alternar = vi.fn();
    render(
      <TablaEquipos
        filas={[fila]}
        orden={{ orden: { key: null, dir: "desc" }, alternar }}
        nombreDe={(f) => f.nombre}
      />,
    );

    expect(screen.getByText("66.7")).toBeInTheDocument();
    const th = screen.getByRole("button", { name: "%" });
    await user.click(th);
    expect(alternar).toHaveBeenCalledWith("rend");
  });
});
