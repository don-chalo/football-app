import { beforeEach, describe, expect, it } from "vitest";
import { FakeConvocatorias, FakeEquipos, FakeEventos, FakeJugadores, FakeLigas, FakePartidos, resetIds } from "../testing/fakes";
import { createEstadisticasService } from "./estadisticas.service";

function setup() {
  const cast = (x: unknown) => x as never;
  const ligas = new FakeLigas();
  const equipos = new FakeEquipos();
  const jugadores = new FakeJugadores();
  const partidos = new FakePartidos();
  const conv = new FakeConvocatorias();
  const evs = new FakeEventos();
  const svc = createEstadisticasService({
    partidos: cast(partidos), convocatorias: cast(conv), eventos: cast(evs), equipos: cast(equipos), jugadores: cast(jugadores),
  });
  return { ligas, equipos, jugadores, partidos, conv, evs, svc };
}

describe("estadisticas service", () => {
  beforeEach(() => resetIds());
  it("tabla solo finalizados, rango >1 ano 422, tanda no contamina", async () => {
    const { ligas, equipos, jugadores, partidos, conv, evs, svc } = setup();
    const liga = await ligas.create({ nombre: "L", formato: "liga" });
    const a = await equipos.create("A");
    const b = await equipos.create("B");
    const j = await jugadores.create("Juan");
    const p1 = await partidos.create({ ligaId: liga.id, localId: a.id, visitaId: b.id, fecha: new Date("2026-03-01") });
    await conv.create({ partidoId: p1.id, jugadorId: j.id, equipoId: a.id, estado: "convocado" });
    await evs.create({ partidoId: p1.id, jugadorId: j.id, equipoId: a.id, tipo: "gol", minuto: null });
    await partidos.update(p1.id, { estado: "finalizado" });
    // en_juego no cuenta
    const p2 = await partidos.create({ ligaId: liga.id, localId: b.id, visitaId: a.id, fecha: new Date("2026-04-01") });
    await evs.create({ partidoId: p2.id, jugadorId: j.id, equipoId: b.id, tipo: "gol", minuto: null });
    await partidos.update(p2.id, { estado: "en_juego" });
    // tanda en campos del partido (no eventos): no afecta
    await partidos.update(p1.id, { penalesLocal: 5, penalesVisita: 4, clasificadoId: a.id });

    const tabla = await svc.equipos({ desde: "2026-01-01", hasta: "2026-12-31" });
    const fa = tabla.find((t) => t.equipoId === a.id)!;
    expect(fa).toMatchObject({ pj: 1, pg: 1, gf: 1, gc: 0, pts: 3 });
    await expect(svc.equipos({ desde: "2024-01-01", hasta: "2026-12-31" })).rejects.toMatchObject({ status: 422 });
  });

  it("jugadores: 2 partidos en 2 equipos ganadores => PJ=2 PG=2 + inasistencia", async () => {
    const { ligas, equipos, jugadores, partidos, conv, evs, svc } = setup();
    const liga = await ligas.create({ nombre: "L", formato: "liga" });
    const a = await equipos.create("A");
    const b = await equipos.create("B");
    const c = await equipos.create("C");
    const d = await equipos.create("D");
    const j = await jugadores.create("Juan");
    const p1 = await partidos.create({ ligaId: liga.id, localId: a.id, visitaId: b.id, fecha: new Date("2026-02-01") });
    const p2 = await partidos.create({ ligaId: liga.id, localId: c.id, visitaId: d.id, fecha: new Date("2026-03-01") });
    await conv.create({ partidoId: p1.id, jugadorId: j.id, equipoId: a.id, estado: "convocado" });
    await conv.create({ partidoId: p2.id, jugadorId: j.id, equipoId: c.id, estado: "convocado" });
    await evs.create({ partidoId: p1.id, jugadorId: j.id, equipoId: a.id, tipo: "gol", minuto: null });
    await evs.create({ partidoId: p2.id, jugadorId: j.id, equipoId: c.id, tipo: "gol", minuto: null });
    await partidos.update(p1.id, { estado: "finalizado" });
    await partidos.update(p2.id, { estado: "finalizado" });
    const [f] = await svc.jugadores({ desde: "2026-01-01", hasta: "2026-12-31" });
    expect(f).toMatchObject({ pj: 2, pg: 2, pe: 0, pp: 0, goles: 2, inasistencia: 0 });
  });

  it("enfrentamientos A vs B", async () => {
    const { ligas, equipos, partidos, svc } = setup();
    const liga = await ligas.create({ nombre: "L", formato: "liga" });
    const a = await equipos.create("A");
    const b = await equipos.create("B");
    const p1 = await partidos.create({ ligaId: liga.id, localId: a.id, visitaId: b.id, fecha: new Date("2026-02-01") });
    await partidos.update(p1.id, { estado: "finalizado" });
    const h = await svc.enfrentamientos({ equipoA: a.id, equipoB: b.id, desde: "2026-01-01", hasta: "2026-12-31" });
    expect(h.pj).toBe(1);
  });
});
