import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Convocatorias } from "./PartidoManagePage";
import type { PartidoDetalle } from "../api/types";

const conv: PartidoDetalle["convocatorias"] = [
  { id: "c1", partidoId: "p", jugadorId: "j1", equipoId: "e1", estado: "convocado", createdBy: null, createdAt: null },
  { id: "c2", partidoId: "p", jugadorId: "j2", equipoId: "e1", estado: "convocado", createdBy: null, createdAt: null },
];

const evConGol: PartidoDetalle["eventos"] = [
  { id: "ev1", partidoId: "p", jugadorId: "j1", equipoId: "e1", tipo: "gol", minuto: null, createdBy: null, createdAt: null },
];

function mockFetch() {
  return vi.fn(async (): Promise<Response> => new Response(JSON.stringify([]), { status: 200 }));
}

function renderConv(eventos: PartidoDetalle["eventos"], onCambio: () => void) {
  return render(
    <MemoryRouter>
      <Convocatorias partidoId="p" localId="e1" visitaId="e2" lista={conv} eventos={eventos} onCambio={onCambio} />
    </MemoryRouter>,
  );
}

describe("quitar convocado", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("dos pasos confirman el borrado (DELETE)", async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch();
    vi.stubGlobal("fetch", fetchMock);
    const onCambio = vi.fn();
    renderConv([], onCambio);

    const quitar = screen.getAllByText("Quitar");
    await user.click(quitar[0] as HTMLElement);
    await user.click(screen.getByText("Confirmar"));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/convocatorias/c1"),
        expect.objectContaining({ method: "DELETE" }),
      );
    });
    expect(onCambio).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("bloquea si tiene goles y no borra", async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch();
    vi.stubGlobal("fetch", fetchMock);
    renderConv(evConGol, vi.fn());

    const quitar = screen.getAllByText("Quitar");
    await user.click(quitar[0] as HTMLElement);
    await user.click(screen.getByText("Confirmar"));

    await waitFor(() => {
      expect(screen.getByText(/tiene goles registrados/)).toBeInTheDocument();
    });
    expect(fetchMock).not.toHaveBeenCalledWith(
      expect.stringContaining("/convocatorias/"),
      expect.objectContaining({ method: "DELETE" }),
    );
    vi.unstubAllGlobals();
  });
});
