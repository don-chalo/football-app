import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { Evento } from "../api/types";
import { Cronologia } from "./Cronologia";

function evento(parcial: Partial<Evento> & { id: string }): Evento {
  return {
    partidoId: "p1",
    jugadorId: "j1",
    equipoId: "e1",
    tipo: "gol",
    minuto: 10,
    createdBy: null,
    createdAt: null,
    ...parcial,
  };
}

const props = {
  nombreJugador: (id: string): string => ({ j1: "Juan", j2: "Pedro" })[id] ?? "?",
  nombreEquipo: (id: string): string => ({ e1: "Local", e2: "Visita" })[id] ?? "?",
  inicioEn: "2026-10-14T20:00:00.000Z",
  finEn: null as string | null,
  estadoPartido: "en_juego" as const,
  minutoFin: null as number | null,
};

describe("Cronologia", () => {
  it("muestra fila con jugador, icono, minuto y equipo en orden inverso", () => {
    render(
      <Cronologia
        {...props}
        eventos={[evento({ id: "a", jugadorId: "j1", minuto: 10 }), evento({ id: "b", jugadorId: "j2", equipoId: "e2", tipo: "roja", minuto: 80 })]}
      />
    );
    expect(screen.getByText("Cronología")).toBeInTheDocument();
    const filas = screen.getAllByRole("listitem");
    expect(filas[0]).toHaveTextContent("Pedro");
    expect(filas[0]).toHaveTextContent("80'");
    expect(filas[0]).toHaveTextContent("(Visita)");
    expect(filas[1]).toHaveTextContent("Juan");
    expect(screen.getByLabelText("Tarjeta roja de Pedro")).toBeInTheDocument();
    expect(screen.getByLabelText("Gol de Juan")).toBeInTheDocument();
  });

  it("muestra hitos de inicio y fin", () => {
    render(
      <Cronologia
        {...props}
        eventos={[]}
        finEn="2026-10-14T22:00:00.000Z"
        estadoPartido="finalizado"
        minutoFin={95}
      />
    );
    expect(screen.getByText(/Fin /)).toBeInTheDocument();
    expect(screen.getByText(/Inicio /)).toBeInTheDocument();
  });

  it("muestra vacio cuando no hay eventos ni hitos", () => {
    render(
      <Cronologia
        {...props}
        eventos={[]}
        inicioEn={null}
        estadoPartido="programado"
      />
    );
    expect(screen.getByText("Sin goles.")).toBeInTheDocument();
  });

  it("colapsable muestra contador y expande al tocar", async () => {
    const user = userEvent.setup();
    render(
      <Cronologia
        {...props}
        colapsable
        abiertaInicial={false}
        eventos={[evento({ id: "a" })]}
      />
    );
    const boton = screen.getByRole("button", { name: /Cronología \(1\)/ });
    expect(screen.queryByLabelText("Gol de Juan")).not.toBeInTheDocument();
    await user.click(boton);
    expect(screen.getByLabelText("Gol de Juan")).toBeInTheDocument();
  });
});
