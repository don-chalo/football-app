import { describe, expect, it } from "vitest";
import type { Evento, PartidoDetalle } from "../api/types";
import { enlaceWhatsApp, textoResultado } from "./compartir";

function evento(parcial: Partial<Evento> & { jugadorId: string; tipo: Evento["tipo"] }): Evento {
  return {
    id: `e-${parcial.jugadorId}-${parcial.minuto ?? "s"}`,
    partidoId: "p1",
    equipoId: "e1",
    minuto: null,
    createdBy: null,
    createdAt: null,
    ...parcial,
  };
}

function detalle(eventos: Evento[], penales: boolean): PartidoDetalle {
  return {
    id: "p1",
    ligaId: "l1",
    localId: "e1",
    visitaId: "e2",
    fecha: "2026-10-12T15:00:00Z",
    estado: "finalizado",
    fase: "Fecha 5",
    idaDe: null,
    penalesLocal: penales ? 4 : null,
    penalesVisita: penales ? 3 : null,
    clasificadoId: null,
    inicioEn: null,
    pausaDesde: null,
    pausaAcumSeg: 0,
    finEn: "2026-10-12T16:45:00Z",
    createdBy: null,
    createdAt: null,
    marcador: { local: 2, visita: 1 },
    convocatorias: [],
    eventos,
  };
}

const nombres = {
  equipos: new Map([["e1", "Alfa"], ["e2", "Beta"]]),
  jugadores: new Map([["j1", "Juan"], ["j2", "Pedro"], ["j3", "López"]]),
  liga: "Apertura",
};

const ORIGIN = "https://tusitio.com";

describe("textoResultado", () => {
  it("partido con minutos agrupa por jugador con sufijos", () => {
    const d = detalle(
      [
        evento({ jugadorId: "j1", tipo: "gol", minuto: 23 }),
        evento({ jugadorId: "j2", tipo: "penal", minuto: 45 }),
        evento({ jugadorId: "j1", tipo: "gol", minuto: 67 }),
      ],
      false,
    );
    d.marcador = { local: 2, visita: 1 };
    const texto = textoResultado(d, nombres, ORIGIN);
    expect(texto).toContain("ALFA 2 - 1 BETA");
    expect(texto).toContain("Apertura · ");
    expect(texto).toContain("Goles:\n- Juan 23', 67'\n- Pedro 45'(p)");
    expect(texto).toContain(`${ORIGIN}/partidos/p1`);
  });

  it("autogol se lista con (ag)", () => {
    const d = detalle(
      [
        evento({ jugadorId: "j1", tipo: "gol", minuto: 23 }),
        evento({ jugadorId: "j3", tipo: "autogol", minuto: 55, equipoId: "e1" }),
        evento({ jugadorId: "j2", tipo: "gol", minuto: 67 }),
      ],
      false,
    );
    d.marcador = { local: 2, visita: 2 };
    expect(textoResultado(d, nombres, ORIGIN)).toContain("- López 55'(ag)");
  });

  it("sin minutos usa conteo de goleadores", () => {
    const d = detalle(
      [
        evento({ jugadorId: "j1", tipo: "gol" }),
        evento({ jugadorId: "j1", tipo: "gol" }),
        evento({ jugadorId: "j2", tipo: "gol" }),
      ],
      false,
    );
    const texto = textoResultado(d, nombres, ORIGIN);
    expect(texto).toContain("Goleadores:\n- Juan 2 goles\n- Pedro 1 gol");
    expect(texto).not.toContain("Goles:");
  });

  it("goleadores sin minutos ordenados descendente", () => {
    const d = detalle(
      [
        evento({ jugadorId: "j2", tipo: "gol" }),
        evento({ jugadorId: "j1", tipo: "gol" }),
        evento({ jugadorId: "j1", tipo: "gol" }),
      ],
      false,
    );
    const texto = textoResultado(d, nombres, ORIGIN);
    expect(texto).toContain("Goleadores:\n- Juan 2 goles\n- Pedro 1 gol");
  });

  it("minuto mixto: con minuto cronológico, sin minuto a secas", () => {
    const d = detalle(
      [
        evento({ jugadorId: "j1", tipo: "gol", minuto: 23 }),
        evento({ jugadorId: "j2", tipo: "gol" }),
      ],
      false,
    );
    const texto = textoResultado(d, nombres, ORIGIN);
    expect(texto).toContain("- Juan 23'");
    expect(texto).toContain("- Pedro\n");
  });

  it("penales agregan línea y 0-0 muestra Sin goles", () => {
    const conPenales = detalle([evento({ jugadorId: "j1", tipo: "gol", minuto: 34 })], true);
    conPenales.marcador = { local: 1, visita: 1 };
    expect(textoResultado(conPenales, nombres, ORIGIN)).toContain("Penales: 4 - 3");

    const cero = detalle([], false);
    cero.marcador = { local: 0, visita: 0 };
    const texto = textoResultado(cero, nombres, ORIGIN);
    expect(texto).toContain("Sin goles.");
    expect(texto).not.toContain("Penales:");
  });

  it("enlaceWhatsApp codifica el texto", () => {
    const href = enlaceWhatsApp("ALFA 2 - 1 BETA\nJuan 23'");
    expect(href.startsWith("https://wa.me/?text=")).toBe(true);
    expect(href).toContain(encodeURIComponent("ALFA 2 - 1 BETA"));
    expect(href).not.toContain("\n");
  });
});
