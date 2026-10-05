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
        estadoPartido="en_juego"
        localId="e1"
        visitaId="e2"
        minutoAuto={null}
        inicioEn={null}
        finEn={null}
        minutoFin={null}
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
        estadoPartido="en_juego"
        localId="e1"
        visitaId="e2"
        minutoAuto={null}
        inicioEn={null}
        finEn={null}
        minutoFin={null}
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
        estadoPartido="en_juego"
        localId="e1"
        visitaId="e2"
        minutoAuto={null}
        inicioEn={null}
        finEn={null}
        minutoFin={null}
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
        estadoPartido="en_juego"
        localId="e1"
        visitaId="e2"
        minutoAuto={null}
        inicioEn={null}
        finEn={null}
        minutoFin={null}
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
        estadoPartido="en_juego"
        localId="e1"
        visitaId="e2"
        minutoAuto={null}
        inicioEn={null}
        finEn={null}
        minutoFin={null}
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
        estadoPartido="en_juego"
        localId="e1"
        visitaId="e2"
        minutoAuto={null}
        inicioEn={null}
        finEn={null}
        minutoFin={null}
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

describe("CargaVivo lista unificada", () => {
  const nombres: Record<string, string> = { j1: "Juan", j2: "Pedro", e1: "Alfa", e2: "Beta" };
  const base: Convocatoria[] = [
    { id: "c1", partidoId: "p", jugadorId: "j1", equipoId: "e1", estado: "convocado", createdBy: null, createdAt: null },
    { id: "c2", partidoId: "p", jugadorId: "j2", equipoId: "e1", estado: "ausente", createdBy: null, createdAt: null },
  ];
  const golJ1: Evento = {
    id: "ev1", partidoId: "p", jugadorId: "j1", equipoId: "e1", tipo: "gol", minuto: 10, createdBy: null, createdAt: null,
  };

  function mockApi() {
    return vi.fn(async (url: string | URL, init?: RequestInit): Promise<Response> => {
      const u = String(url);
      const m = init?.method ?? "GET";
      if (m === "POST" && u.endsWith("/convocatorias")) {
        return new Response(JSON.stringify({ id: "c9" }), { status: 201 });
      }
      if (m === "GET" && u.endsWith("/jugadores")) {
        return new Response(JSON.stringify([{ id: "j9", nombre: "Diego" }]), { status: 200 });
      }
      if (m === "DELETE") return new Response(null, { status: 204 });
      return new Response(JSON.stringify({ id: "c1" }), { status: 200 });
    });
  }

  function renderUni(estado: "programado" | "en_juego" | "finalizado" | "suspendido" = "en_juego", onCambio: () => void = vi.fn()) {
    return render(
      <CargaVivo
        partidoId="p"
        estadoPartido={estado}
        localId="e1"
        visitaId="e2"
        minutoAuto={null}
        inicioEn={null}
        finEn={null}
        minutoFin={null}
        convocatorias={base}
        eventos={[]}
        nombreJugador={(id) => nombres[id] ?? id}
        nombreEquipo={(id) => nombres[id] ?? id}
        onCambio={onCambio}
      />,
    );
  }

  it("ausente visible y su sheet ofrece Presente/Quitar/GOL", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi();
    vi.stubGlobal("fetch", fetchMock);
    renderUni();

    expect(screen.getByText("(ausente)")).toBeInTheDocument();
    await user.click(screen.getByText("Pedro"));
    expect(await screen.findByText("GOL")).toBeInTheDocument();
    expect(screen.getByText("Presente")).toBeInTheDocument();
    expect(screen.getByText("Quitar")).toBeInTheDocument();

    await user.click(screen.getByText("Presente"));
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/convocatorias/c2"),
        expect.objectContaining({ method: "PATCH" }),
      );
    });
    const [, init] = fetchMock.mock.calls.find(([, i]) => (i as RequestInit).method === "PATCH") as unknown as [string, RequestInit];
    expect(JSON.parse(init.body as string) as unknown).toMatchObject({ estado: "convocado" });
    vi.unstubAllGlobals();
  });

  it("quitar en dos pasos hace DELETE", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi();
    vi.stubGlobal("fetch", fetchMock);
    const onCambio = vi.fn();
    renderUni("en_juego", onCambio);

    await user.click(screen.getByText("Juan"));
    await user.click(await screen.findByText("Quitar"));
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

  it("quitar bloqueado si tiene goles", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi();
    vi.stubGlobal("fetch", fetchMock);
    render(
      <CargaVivo
        partidoId="p"
        estadoPartido="en_juego"
        localId="e1"
        visitaId="e2"
        minutoAuto={null}
        inicioEn={null}
        finEn={null}
        minutoFin={null}
        convocatorias={base}
        eventos={[golJ1]}
        nombreJugador={(id) => nombres[id] ?? id}
        nombreEquipo={(id) => nombres[id] ?? id}
        onCambio={vi.fn()}
      />,
    );

    await user.click(screen.getByText("Juan"));
    await user.click(await screen.findByText("Quitar"));
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

  it("agregar por equipo suma en silencio", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi();
    vi.stubGlobal("fetch", fetchMock);
    const onCambio = vi.fn();
    renderUni("en_juego", onCambio);

    await user.click(screen.getAllByText("+ Agregar jugador")[0] as HTMLElement);
    expect(await screen.findByText("Alfa · Agregar")).toBeInTheDocument();
    await user.click(await screen.findByText("Diego"));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/partidos/p/convocatorias"),
        expect.objectContaining({ method: "POST" }),
      );
    });
    const [, init] = fetchMock.mock.calls.find(([, i]) => (i as RequestInit).method === "POST") as unknown as [string, RequestInit];
    expect(JSON.parse(init.body as string) as unknown).toMatchObject({ jugadorId: "j9", equipoId: "e1" });
    expect(onCambio).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("programado no ofrece goles en el sheet", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", mockApi());
    renderUni("programado");

    await user.click(screen.getByText("Juan"));
    expect(await screen.findByText("Ausente")).toBeInTheDocument();
    expect(screen.getByText("Quitar")).toBeInTheDocument();
    expect(screen.queryByText("GOL")).not.toBeInTheDocument();
    expect(screen.getAllByText("+ Agregar jugador")).toHaveLength(2);
    vi.unstubAllGlobals();
  });
});

describe("CargaVivo minuto automatico", () => {
  it("con reloj en marcha muestra auto y envia sin campo", async () => {
    const user = userEvent.setup();
    const fetchMock = mockDetalle();
    vi.stubGlobal("fetch", fetchMock);
    render(
      <CargaVivo
        partidoId="p"
        estadoPartido="en_juego"
        localId="e1"
        visitaId="e2"
        minutoAuto={64}
        inicioEn="2026-03-01T15:00:00Z"
        finEn={null}
        minutoFin={null}
        convocatorias={conv}
        eventos={[]}
        nombreJugador={() => "Juan"}
        nombreEquipo={() => "Los Pibes"}
        onCambio={vi.fn()}
      />,
    );

    await user.click(screen.getByText("Juan"));
    expect(await screen.findByText("Minuto: 64' (auto)")).toBeInTheDocument();
    expect(screen.queryByLabelText("Minuto (opcional)")).not.toBeInTheDocument();
    await user.click(screen.getByText("GOL"));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/partidos/p/eventos"),
        expect.objectContaining({ method: "POST" }),
      );
    });
    const [, init] = fetchMock.mock.calls.find(([, i]) => (i as RequestInit).method === "POST") as unknown as [string, RequestInit];
    expect(JSON.parse(init.body as string) as unknown).toMatchObject({ minuto: 64 });
    vi.unstubAllGlobals();
  });

  it("hitos inicio y fin en cronologia", async () => {
    vi.stubGlobal("fetch", mockDetalle());
    render(
      <CargaVivo
        partidoId="p"
        estadoPartido="finalizado"
        localId="e1"
        visitaId="e2"
        minutoAuto={null}
        inicioEn="2026-03-01T15:00:00Z"
        finEn="2026-03-01T16:33:00Z"
        minutoFin={94}
        convocatorias={conv}
        eventos={[]}
        nombreJugador={() => "Juan"}
        nombreEquipo={() => "Los Pibes"}
        onCambio={vi.fn()}
      />,
    );

    expect(await screen.findByText(/^Inicio \d{2}:\d{2}$/)).toBeInTheDocument();
    expect(screen.getByText(/^Fin \d{2}:\d{2} · 94'$/)).toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});

describe("CargaVivo suspendido", () => {
  it("lista visible sin acciones", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", mockDetalle());
    render(
      <CargaVivo
        partidoId="p"
        estadoPartido="suspendido"
        localId="e1"
        visitaId="e2"
        minutoAuto={null}
        inicioEn={null}
        finEn={null}
        minutoFin={null}
        convocatorias={conv}
        eventos={[]}
        nombreJugador={() => "Juan"}
        nombreEquipo={() => "Los Pibes"}
        onCambio={vi.fn()}
      />,
    );

    expect(screen.getByText("Juan")).toBeInTheDocument();
    expect(screen.queryByText("+ Agregar jugador")).not.toBeInTheDocument();
    const fila = screen.getByText("Juan").closest("button");
    expect(fila).toBeDisabled();
    await user.click(fila as HTMLElement);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});
