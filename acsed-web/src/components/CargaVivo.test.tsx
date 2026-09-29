import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CargaVivo } from "./CargaVivo";
import type { Convocatoria } from "../api/types";

const conv: Convocatoria[] = [
  { id: "c1", partidoId: "p", jugadorId: "j1", equipoId: "e1", estado: "convocado", createdBy: null, createdAt: null },
];

function mockDetalle() {
  return vi.fn(async (url: string | URL, init?: RequestInit): Promise<Response> => {
    const u = String(url);
    if (init?.method === "POST" && u.endsWith("/eventos")) {
      return new Response(JSON.stringify({ id: "ev9", tipo: "gol" }), { status: 201 });
    }
    if (init?.method === "DELETE") return new Response(null, { status: 204 });
    return new Response("[]", { status: 200 });
  });
}

describe("CargaVivo flujo crítico 2 taps", () => {
  it("tap jugador + tap GOL registra POST y Deshacer borra", async () => {
    const user = userEvent.setup();
    const fetchMock = mockDetalle();
    vi.stubGlobal("fetch", fetchMock);
    const onCambio = vi.fn();

    render(
      <CargaVivo
        partidoId="p"
        convocatorias={conv}
        eventos={[]}
        nombreJugador={() => "Juan"}
        nombreEquipo={() => "Los Pibes"}
        onCambio={onCambio}
      />,
    );

    await user.click(screen.getByText("Juan"));
    await user.click(screen.getByText("GOL"));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/partidos/p/eventos"),
        expect.objectContaining({ method: "POST" }),
      );
    });
    const [, init] = fetchMock.mock.calls.find(([, i]) => (i as RequestInit).method === "POST") as unknown as [string, RequestInit];
    expect(JSON.parse(init.body as string) as unknown).toMatchObject({ jugadorId: "j1", equipoId: "e1", tipo: "gol" });

    await user.click(screen.getByText("Deshacer"));
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/eventos/ev9"),
        expect.objectContaining({ method: "DELETE" }),
      );
    });
    expect(onCambio).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
