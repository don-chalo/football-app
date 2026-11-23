import { describe, expect, it } from "vitest";
import { buildJugadores } from "./jugadores";
import { buildTabla } from "./tabla";
import type { ConvocatoriaBase, EventoBase, PartidoBase } from "./types";

function p(
  id: string,
  fecha: string,
  localId: string,
  visitaId: string,
  eventos: EventoBase[] = [],
  mvpJugadorId: string | null = null,
): PartidoBase {
  return { id, ligaId: "l1", localId, visitaId, fecha: new Date(fecha), estado: "finalizado", mvpJugadorId, eventos };
}
const gol = (jugadorId: string, equipoId: string): EventoBase => ({ jugadorId, equipoId, tipo: "gol" });
const conv = (partidoId: string, jugadorId: string, equipoId: string, estado: "convocado" | "ausente" = "convocado"): ConvocatoriaBase =>
  ({ partidoId, jugadorId, equipoId, estado });

describe("buildTabla (nuevas)", () => {
  it("racha: ultimos 5 del mas reciente al mas antiguo, con G/E/P", () => {
    // A: p1 gana 1-0, p2 empata 1-1, p3 pierde 0-1, p4 gana 2-0, p5 gana 1-0, p6 gana 1-0 (mas reciente)
    const partidos = [
      p("p1", "2026-01-01", "A", "B", [gol("x", "A")]),
      p("p2", "2026-01-02", "A", "C", [gol("x", "A"), gol("y", "C")]),
      p("p3", "2026-01-03", "D", "A", [gol("z", "D")]),
      p("p4", "2026-01-04", "A", "B", [gol("x", "A"), gol("x", "A")]),
      p("p5", "2026-01-05", "A", "C", [gol("x", "A")]),
      p("p6", "2026-01-06", "A", "D", [gol("x", "A")]),
    ];
    const a = buildTabla(partidos).find((f) => f.equipoId === "A")!;
    // mas reciente primero: p6 G, p5 G, p4 G, p3 P, p2 E (p1 queda fuera de las 5)
    expect(a.racha).toEqual(["G", "G", "G", "P", "E"]);
    expect(a.racha).toHaveLength(5);
  });

  it("racha: respeta orden por fecha aunque el array venga desordenado", () => {
    const partidos = [
      p("pB", "2026-02-10", "A", "B", [gol("x", "B")]),
      p("pA", "2026-02-01", "A", "B", [gol("x", "A")]),
    ];
    const a = buildTabla(partidos).find((f) => f.equipoId === "A")!;
    expect(a.racha).toEqual(["P", "G"]);
  });

  it("pctGf / pctGc = GF/PJ y GC/PJ con 1 decimal; null sin partidos", () => {
    const partidos = [
      p("p1", "2026-01-01", "A", "B", [gol("x", "A"), gol("x", "A"), gol("y", "B")]),
      p("p2", "2026-01-02", "B", "A", [gol("y", "B")]),
    ];
    const tabla = buildTabla(partidos);
    const a = tabla.find((f) => f.equipoId === "A")!;
    // A: GF=2, GC=2 en 2 partidos
    expect(a).toMatchObject({ pctGf: 1, pctGc: 1 });
    const b = tabla.find((f) => f.equipoId === "B")!;
    // B: GF=2 (y en p1, y en p2), GC=2
    expect(b).toMatchObject({ pctGf: 1, pctGc: 1 });
  });

  it("pctGf 1 decimal (2.333 -> 2.3)", () => {
    const partidos = [
      p("p1", "2026-01-01", "A", "B", [gol("x", "A"), gol("x", "A")]),
      p("p2", "2026-01-02", "A", "B", [gol("x", "A")]),
      p("p3", "2026-01-03", "A", "B", [gol("x", "A")]),
    ];
    const a = buildTabla(partidos).find((f) => f.equipoId === "A")!;
    // GF=4 en PJ=3 -> 1.333.. -> 1.3
    expect(a.pctGf).toBe(1.3);
  });
});

describe("buildJugadores (nuevas)", () => {
  it("racha de goles: partidos consecutivos anotando desde el mas reciente; autogol y ausencia cortan", () => {
    const partidos = [
      p("p1", "2026-01-01", "A", "B", [gol("j", "A")]),
      p("p2", "2026-01-02", "A", "B", [gol("j", "A")]),
      p("p3", "2026-01-03", "A", "B", [{ jugadorId: "j", equipoId: "A", tipo: "autogol" }]),
      p("p4", "2026-01-04", "A", "B", [gol("j", "A")]),
      p("p5", "2026-01-05", "A", "B", [gol("j", "A")]),
    ];
    const convs = partidos.map((x) => conv(x.id, "j", "A"));
    const [f] = buildJugadores(partidos, convs);
    // desde p5 hacia atras: p5 gol, p4 gol, p3 autogol (sin gol) -> corta => 2
    expect(f!.rachaGoles).toBe(2);
  });

  it("racha de goles: penal cuenta; ausencia corta", () => {
    const partidos = [
      p("p1", "2026-01-01", "A", "B", [gol("j", "A")]),
      p("p2", "2026-01-02", "A", "B", [{ jugadorId: "j", equipoId: "A", tipo: "penal" }]),
      p("p3", "2026-01-03", "A", "B", [gol("j", "A")]),
    ];
    const convs = [conv("p1", "j", "A"), conv("p2", "j", "A"), conv("p3", "j", "A", "ausente")];
    const [f] = buildJugadores(partidos, convs);
    // p3 ausente no cuenta como participacion; desde p2: penal, p1: gol => 2
    expect(f!.rachaGoles).toBe(2);
  });

  it("racha de jugador: considera partidos de todos los equipos en los que estuvo presente", () => {
    const partidos = [
      p("p1", "2026-01-01", "A", "B", [gol("j", "A")]),       // j en A, gana
      p("p2", "2026-01-02", "C", "D", [gol("y", "D")]),       // j en C, pierde
      p("p3", "2026-01-03", "E", "F", [gol("j", "E")]),       // j en E, gana
    ];
    const convs = [conv("p1", "j", "A"), conv("p2", "j", "C"), conv("p3", "j", "E")];
    const [f] = buildJugadores(partidos, convs);
    expect(f!.racha).toEqual(["G", "P", "G"]);
  });

  it("mvp cuenta partidos donde es mvpJugadorId", () => {
    const partidos = [
      p("p1", "2026-01-01", "A", "B", [gol("j", "A")], "j"),
      p("p2", "2026-01-02", "A", "B", [gol("j", "A")], "otro"),
      p("p3", "2026-01-03", "A", "B", [gol("j", "A")], "j"),
    ];
    const convs = partidos.map((x) => conv(x.id, "j", "A"));
    const [f] = buildJugadores(partidos, convs);
    expect(f!.mvp).toBe(2);
  });

  it("promedios y ratios con PJ=0 quedan en null", () => {
    const [f] = buildJugadores([], [conv("p-inexistente", "j", "A")]);
    expect(f).toMatchObject({ pj: 0, promedioGoles: null, pctGf: null, pctGc: null, racha: [] });
  });

  it("promedioGoles = goles/PJ, pctGf/pctGc = GF/GC del equipo del jugador / PJ", () => {
    const partidos = [
      p("p1", "2026-01-01", "A", "B", [gol("j", "A"), gol("j", "A"), gol("z", "B")]),
      p("p2", "2026-01-02", "A", "B", [gol("z", "B")]),
    ];
    const convs = [conv("p1", "j", "A"), conv("p2", "j", "A")];
    const [f] = buildJugadores(partidos, convs);
    // goles=2, PJ=2 -> 1 ; GF equipo: 2 + 0 = 2 -> 1 ; GC equipo: 1 + 1 = 2 -> 1
    expect(f).toMatchObject({ promedioGoles: 1, pctGf: 1, pctGc: 1 });
  });
});
