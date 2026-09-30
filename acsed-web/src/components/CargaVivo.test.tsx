import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CargaVivo } from "./CargaVivo";
import type { Convocatoria, Evento } from "../api/types";

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

describe("CargaVivo compacta", () => {
  const convocados: Convocatoria[] = [
    { id: "c1", partidoId: "p", jugadorId: "j1", equipoId: "e1", estado: "convocado", createdBy: null, createdAt: null },
    { id: "c2", partidoId: "p", jugadorId: "j2", equipoId: "e1", estado: "convocado", createdBy: null, createdAt: null },
    { id: "c3", partidoId: "p", jugadorId: "j3", equipoId: "e1", estado: "convocado", createdBy: null, createdAt: null },
  ];
  const nombres: Record<string, string> = { j1: "Juan", j2: "Pedro", j3: "Luis", e1: "Los Pibes" };
  const evento = (id: string, jugadorId: string, tipo: Evento["tipo"]): Evento => ({
    id,
    partidoId: "p",
    jugadorId,
    equipoId: "e1",
    tipo,
    minuto: null,
    createdBy: null,
    createdAt: null,
  });

  it("muestra solo conteos mayores que cero con espacio", () => {
    vi.stubGlobal("fetch", mockDetalle());
    render(
      <CargaVivo
        partidoId="p"
        convocatorias={convocados}
        eventos={[evento("ev1", "j1", "gol"), evento("ev2", "j1", "gol"), evento("ev3", "j1", "penal"), evento("ev4", "j2", "autogol")]}
        nombreJugador={(id) => nombres[id] ?? id}
        nombreEquipo={() => "Los Pibes"}
        onCambio={vi.fn()}
      />,
    );

    expect(screen.getByText("G 2 · P 1")).toBeInTheDocument();
    expect(screen.getByText("AG 1")).toBeInTheDocument();
    expect(screen.queryByText("G 0")).not.toBeInTheDocument();
    expect(screen.queryByText("P 0")).not.toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it("quitar abre solo los eventos del jugador y borra sin tocar otros", async () => {
    const user = userEvent.setup();
    const fetchMock = mockDetalle();
    vi.stubGlobal("fetch", fetchMock);
    const onCambio = vi.fn();
    const { rerender } = render(
      <CargaVivo
        partidoId="p"
        convocatorias={convocados}
        eventos={[evento("ev1", "j1", "gol"), evento("ev2", "j2", "penal")]}
        nombreJugador={(id) => nombres[id] ?? id}
        nombreEquipo={() => "Los Pibes"}
        onCambio={onCambio}
      />,
    );

    expect(screen.queryByRole("button", { name: "Quitar gol de Luis" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Quitar gol de Juan" }));
    expect(screen.getByText("Quitar gol de Juan")).toBeInTheDocument();
    expect(screen.getByLabelText("Borrar gol de Juan")).toBeInTheDocument();
    expect(screen.queryByLabelText("Borrar gol de Pedro")).not.toBeInTheDocument();

    await user.click(screen.getByLabelText("Borrar gol de Juan"));
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/eventos/ev1"),
        expect.objectContaining({ method: "DELETE" }),
      );
    });
    expect(fetchMock).not.toHaveBeenCalledWith(
      expect.stringContaining("/eventos/ev2"),
      expect.objectContaining({ method: "DELETE" }),
    );
    expect(onCambio).toHaveBeenCalled();

    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    rerender(
      <CargaVivo
        partidoId="p"
        convocatorias={convocados}
        eventos={[evento("ev2", "j2", "penal")]}
        nombreJugador={(id) => nombres[id] ?? id}
        nombreEquipo={() => "Los Pibes"}
        onCambio={onCambio}
      />,
    );
    expect(screen.queryByRole("button", { name: "Quitar gol de Juan" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Quitar gol de Pedro" })).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it("sin botones anidados y controles con target táctil", () => {
    vi.stubGlobal("fetch", mockDetalle());
    const { container } = render(
      <CargaVivo
        partidoId="p"
        convocatorias={convocados}
        eventos={[evento("ev1", "j1", "gol")]}
        nombreJugador={(id) => nombres[id] ?? id}
        nombreEquipo={() => "Los Pibes"}
        onCambio={vi.fn()}
      />,
    );

    expect(container.querySelectorAll("button button")).toHaveLength(0);
    expect(container.querySelectorAll("button a, a button")).toHaveLength(0);
    const quitar = screen.getByRole("button", { name: "Quitar gol de Juan" });
    expect(quitar.className).toContain("min-h-11");
    expect(quitar.className).toContain("min-w-11");
    vi.unstubAllGlobals();
  });

  it("cronología colapsada sigue expandible con borrado por evento", async () => {    const user = userEvent.setup();
    const fetchMock = mockDetalle();
    vi.stubGlobal("fetch", fetchMock);
    render(
      <CargaVivo
        partidoId="p"
        convocatorias={convocados}
        eventos={[evento("ev1", "j1", "gol"), evento("ev2", "j2", "penal")]}
        nombreJugador={(id) => nombres[id] ?? id}
        nombreEquipo={() => "Los Pibes"}
        onCambio={vi.fn()}
      />,
    );

    expect(screen.queryByLabelText("Borrar gol de Juan")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Cronología \(2\)/ }));
    await user.click(screen.getByLabelText("Borrar gol de Juan"));
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/eventos/ev1"),
        expect.objectContaining({ method: "DELETE" }),
      );
    });
    vi.unstubAllGlobals();
  });
});
