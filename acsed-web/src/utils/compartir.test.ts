import { describe, expect, it } from "vitest";
import type { Evento, PartidoDetalle } from "../api/types";
import { enlaceWhatsApp, textoCompartir, textoResultado } from "./compartir";

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
    expect(texto).toContain("Goles:\n- 2 Juan: (23', 67')\n- 1 Pedro: (45'(p))");
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
    expect(textoResultado(d, nombres, ORIGIN)).toContain("- 1 López: (55'(ag))");
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
    expect(texto).toContain("Goles:\n- 2 Juan\n- 1 Pedro");
    expect(texto).not.toContain("Goleadores:");
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
    expect(texto).toContain("Goles:\n- 2 Juan\n- 1 Pedro");
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
    expect(texto).toContain("- 1 Juan: (23')");
    expect(texto).toContain("- 1 Pedro");
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

  it("tarjetas amarillas y rojas entre goles y penales", () => {
    const d = detalle(
      [
        evento({ jugadorId: "j1", tipo: "amarilla" }),
        evento({ jugadorId: "j2", tipo: "amarilla" }),
        evento({ jugadorId: "j2", tipo: "amarilla" }),
        evento({ jugadorId: "j3", tipo: "roja" }),
        evento({ jugadorId: "j1", tipo: "gol", minuto: 10 }),
      ],
      false,
    );
    d.marcador = { local: 1, visita: 0 };
    expect(textoResultado(d, nombres, ORIGIN)).toContain(
      "Goles:\n- 1 Juan: (10')",
    );
    expect(textoResultado(d, nombres, ORIGIN)).toContain("TA: Juan 1, Pedro 2");
    expect(textoResultado(d, nombres, ORIGIN)).toContain("TR: López 1");
    expect(textoResultado(d, nombres, ORIGIN)).not.toContain("Penales:");
  });

  it("sin tarjetas no imprime líneas TA ni TR", () => {
    const d = detalle([evento({ jugadorId: "j1", tipo: "gol", minuto: 10 })], false);
    d.marcador = { local: 1, visita: 0 };
    expect(textoResultado(d, nombres, ORIGIN)).not.toContain("TA:");
    expect(textoResultado(d, nombres, ORIGIN)).not.toContain("TR:");
  });

  it("enlaceWhatsApp codifica el texto", () => {
    const href = enlaceWhatsApp("ALFA 2 - 1 BETA\nJuan 23'");
    expect(href.startsWith("https://wa.me/?text=")).toBe(true);
    expect(href).toContain(encodeURIComponent("ALFA 2 - 1 BETA"));
    expect(href).not.toContain("\n");
  });
});

describe("textoCompartir", () => {
  it("programado muestra vs sin marcador ni goles", () => {
    const d = detalle([evento({ jugadorId: "j1", tipo: "gol", minuto: 10 })], false);
    d.estado = "programado";
    d.marcador = { local: 0, visita: 0 };
    const texto = textoCompartir(d, nombres, ORIGIN, null);
    expect(texto).toContain("ALFA vs BETA");
    expect(texto).not.toContain("0 - 0");
    expect(texto).not.toContain("Goles:");
    expect(texto).toContain("Apertura · ");
    expect(texto).toContain(`${ORIGIN}/partidos/p1`);
  });

  it("en juego muestra header EN VIVO con cuerpo finalizado", () => {
    const d = detalle(
      [
        evento({ jugadorId: "j1", tipo: "gol", minuto: 23 }),
        evento({ jugadorId: "j2", tipo: "penal", minuto: 45 }),
      ],
      false,
    );
    d.estado = "en_juego";
    d.marcador = { local: 1, visita: 1 };
    const texto = textoCompartir(d, nombres, ORIGIN, 50);
    expect(texto).toContain("EN VIVO 50' — ALFA 1 - 1 BETA");
    expect(texto).toContain("Goles:\n- 1 Juan: (23')\n- 1 Pedro: (45'(p))");
    expect(texto).toContain(`${ORIGIN}/partidos/p1`);
  });

  it("en juego sin minutos usa conteo y sin goles muestra Sin goles", () => {
    const sinMinutos = detalle([evento({ jugadorId: "j1", tipo: "gol" })], false);
    sinMinutos.estado = "en_juego";
    sinMinutos.marcador = { local: 1, visita: 0 };
    expect(textoCompartir(sinMinutos, nombres, ORIGIN, 30)).toContain("EN VIVO 30' — ALFA 1 - 0 BETA");
    expect(textoCompartir(sinMinutos, nombres, ORIGIN, 30)).toContain("Goles:\n- 1 Juan");

    const sinGoles = detalle([], false);
    sinGoles.estado = "en_juego";
    sinGoles.marcador = { local: 0, visita: 0 };
    expect(textoCompartir(sinGoles, nombres, ORIGIN, 5)).toContain("Sin goles.");
  });

  it("en juego con penales agrega línea", () => {
    const d = detalle([evento({ jugadorId: "j1", tipo: "gol", minuto: 34 })], true);
    d.estado = "en_juego";
    d.marcador = { local: 1, visita: 1 };
    expect(textoCompartir(d, nombres, ORIGIN, 90)).toContain("Penales: 4 - 3");
  });

  it("finalizado delega a textoResultado y suspendido devuelve null", () => {
    const d = detalle([evento({ jugadorId: "j1", tipo: "gol", minuto: 23 })], false);
    d.marcador = { local: 2, visita: 1 };
    expect(textoCompartir(d, nombres, ORIGIN, null)).toBe(textoResultado(d, nombres, ORIGIN));
    d.estado = "suspendido";
    expect(textoCompartir(d, nombres, ORIGIN, null)).toBeNull();
  });
});
