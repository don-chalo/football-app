import { describe, expect, it } from "vitest";
import { buildHistorial } from "./enfrentamientos";
import { resolveRango } from "./filtros";
import { buildJugadores } from "./jugadores";
import { buildTabla } from "./tabla";
import type { ConvocatoriaBase, PartidoBase } from "./types";

function partido(id: string, localId: string, visitaId: string, golesLocal: number, golesDesc: string): PartidoBase {
  void golesDesc;
  const eventos: PartidoBase["eventos"] = [];
  for (let i = 0; i < golesLocal; i++) eventos.push({ jugadorId: `jl-${id}-${String(i)}`, equipoId: localId, tipo: "gol" });
  return { id, ligaId: "l1", localId, visitaId, fecha: new Date("2026-03-01"), estado: "finalizado", eventos };
}

describe("buildTabla", () => {
  it("calcula PJ/PG/PE/PP/GF/GC/Dif/Pts y ordena Pts>Dif>GF", () => {
    const partidos = [
      partido("p1", "A", "B", 0, ""),
      partido("p2", "A", "C", 0, ""),
    ];
    // p1: A 0 goles... ajustamos: A vence 2-0 a B, empata 1-1 con C
    partidos[0]!.eventos = [
      { jugadorId: "x", equipoId: "A", tipo: "gol" },
      { jugadorId: "x", equipoId: "A", tipo: "gol" },
    ];
    partidos[1]!.eventos = [
      { jugadorId: "x", equipoId: "A", tipo: "gol" },
      { jugadorId: "y", equipoId: "C", tipo: "gol" },
    ];
    const tabla = buildTabla(partidos);
    const a = tabla.find((f) => f.equipoId === "A")!;
    expect(a).toMatchObject({ pj: 2, pg: 1, pe: 1, pp: 0, gf: 3, gc: 1, dif: 2, pts: 4 });
    expect(tabla[0]!.equipoId).toBe("A");
  });
});

describe("buildJugadores", () => {
  it("jugador en 2 equipos ganadores distintos: PJ=2 PG=2", () => {
    const partidos: PartidoBase[] = [
      {
        id: "p1", ligaId: "l1", localId: "A", visitaId: "B",
        fecha: new Date("2026-02-01"), estado: "finalizado",
        eventos: [{ jugadorId: "juan", equipoId: "A", tipo: "gol" }],
      },
      {
        id: "p2", ligaId: "l1", localId: "C", visitaId: "D",
        fecha: new Date("2026-03-01"), estado: "finalizado",
        eventos: [
          { jugadorId: "juan", equipoId: "C", tipo: "gol" },
          { jugadorId: "juan", equipoId: "C", tipo: "penal" },
        ],
      },
    ];
    const conv: ConvocatoriaBase[] = [
      { partidoId: "p1", jugadorId: "juan", equipoId: "A", estado: "convocado" },
      { partidoId: "p2", jugadorId: "juan", equipoId: "C", estado: "convocado" },
    ];
    const [f] = buildJugadores(partidos, conv);
    expect(f).toMatchObject({ pj: 2, pg: 2, pe: 0, pp: 0, goles: 3, autogoles: 0, convocados: 2, ausentes: 0 });
  });

  it("ausentes no suman PJ y calculan %inasistencia", () => {
    const partidos: PartidoBase[] = [
      { id: "p1", ligaId: "l1", localId: "A", visitaId: "B", fecha: new Date(), estado: "finalizado", eventos: [] },
    ];
    const conv: ConvocatoriaBase[] = [
      ...Array.from({ length: 8 }, (_, i) => ({
        partidoId: "p1", jugadorId: "j", equipoId: "A", estado: "convocado" as const, _i: i,
      })).map(({ _i, ...c }) => (void _i, c)),
      { partidoId: "p1", jugadorId: "j", equipoId: "A", estado: "ausente" as const },
      { partidoId: "p1", jugadorId: "j", equipoId: "A", estado: "ausente" as const },
    ];
    const [f] = buildJugadores(partidos, conv);
    expect(f!.convocados).toBe(10);
    expect(f!.ausentes).toBe(2);
    expect(f!.inasistencia).toBe(20);
  });

  it("autogol no suma a goles pero si a autogoles", () => {
    const partidos: PartidoBase[] = [
      {
        id: "p1", ligaId: "l1", localId: "A", visitaId: "B",
        fecha: new Date(), estado: "finalizado",
        eventos: [{ jugadorId: "j", equipoId: "A", tipo: "autogol" }],
      },
    ];
    const conv: ConvocatoriaBase[] = [{ partidoId: "p1", jugadorId: "j", equipoId: "A", estado: "convocado" }];
    const [f] = buildJugadores(partidos, conv);
    expect(f).toMatchObject({ goles: 0, autogoles: 1, pp: 1 });
  });
});

describe("buildHistorial", () => {
  it("agrega enfrentamientos en ambos ordenes de localia", () => {
    const partidos: PartidoBase[] = [
      { id: "p1", ligaId: "l", localId: "A", visitaId: "B", fecha: new Date(), estado: "finalizado",
        eventos: [{ jugadorId: "x", equipoId: "A", tipo: "gol" }] },
      { id: "p2", ligaId: "l", localId: "B", visitaId: "A", fecha: new Date(), estado: "finalizado",
        eventos: [
          { jugadorId: "x", equipoId: "B", tipo: "gol" },
          { jugadorId: "y", equipoId: "A", tipo: "gol" },
        ] },
    ];
    const h = buildHistorial(partidos, "A", "B");
    expect(h).toMatchObject({ pj: 2, ganA: 1, emp: 1, ganB: 0, gfA: 2, gfB: 1 });
  });
});

describe("resolveRango", () => {
  it("default: ano en curso", () => {
    const r = resolveRango(undefined, undefined, new Date("2026-05-10"));
    expect(r.desde.getFullYear()).toBe(2026);
    expect(r.desde.getMonth()).toBe(0);
    expect(r.hasta.getFullYear()).toBe(2026);
  });
  it("rechaza rango mayor a un ano", () => {
    expect(() => resolveRango("2024-01-01", "2026-06-01")).toThrow("rango maximo");
  });
  it("rechaza desde posterior a hasta", () => {
    expect(() => resolveRango("2026-06-01", "2026-01-01")).toThrow();
  });
});
