import { beforeEach, describe, expect, it } from "vitest";
import { FakeConvocatorias, FakeEquipos, FakeEventos, FakeJugadores, FakeLigas, FakePartidos, resetIds } from "../testing/fakes";
import { createConvocatoriasService } from "./convocatorias.service";
import { createEventosService } from "./eventos.service";
import { createPartidosService } from "./partidos.service";

function setup() {
  const ligas = new FakeLigas();
  const equipos = new FakeEquipos();
  const jugadores = new FakeJugadores();
  const partidos = new FakePartidos();
  const conv = new FakeConvocatorias();
  const evs = new FakeEventos();
  const cast = (x: unknown) => x as never;
  const psvc = createPartidosService({ partidos: cast(partidos), ligas: cast(ligas), equipos: cast(equipos), convocatorias: cast(conv), eventos: cast(evs) });
  const csvc = createConvocatoriasService({ convocatorias: cast(conv), partidos: cast(partidos), jugadores: cast(jugadores), equipos: cast(equipos) });
  const esvc = createEventosService({ eventos: cast(evs), convocatorias: cast(conv), partidos: cast(partidos) });
  return { ligas, equipos, jugadores, psvc, csvc, esvc };
}

describe("convocatorias y eventos", () => {
  beforeEach(() => resetIds());
  it("convoca default convocado, rechaza doble equipo y equipo ajeno", async () => {
    const { ligas, equipos, jugadores, psvc, csvc } = setup();
    const liga = await ligas.create({ nombre: "L", formato: "liga" });
    const a = await equipos.create("A");
    const b = await equipos.create("B");
    const c = await equipos.create("C");
    const j = await jugadores.create("Juan");
    const p = await psvc.create({ ligaId: liga.id, localId: a.id, visitaId: b.id, fecha: "2026-03-01T15:00:00Z" });
    const conv = await csvc.convocar(p.id, j.id, a.id);
    expect(conv.estado).toBe("convocado");
    await expect(csvc.convocar(p.id, j.id, b.id)).rejects.toMatchObject({ status: 422 });
    await expect(csvc.convocar(p.id, j.id, c.id)).rejects.toMatchObject({ status: 422 });
  });
  it("gol en programado 422, de ausente 422, en vivo 201, correccion en finalizado ok", async () => {
    const { ligas, equipos, jugadores, psvc, csvc, esvc } = setup();
    const liga = await ligas.create({ nombre: "L", formato: "liga" });
    const a = await equipos.create("A");
    const b = await equipos.create("B");
    const j = await jugadores.create("Juan");
    const k = await jugadores.create("Pedro");
    const p = await psvc.create({ ligaId: liga.id, localId: a.id, visitaId: b.id, fecha: "2026-03-01T15:00:00Z" });
    const cj = await csvc.convocar(p.id, j.id, a.id);
    await csvc.convocar(p.id, k.id, b.id);
    await expect(esvc.registrar(p.id, { jugadorId: j.id, equipoId: a.id, tipo: "gol" })).rejects.toMatchObject({ status: 422 });
    await psvc.cambiarEstado(p.id, "en_juego");
    await csvc.marcar(cj.id, "ausente");
    await expect(esvc.registrar(p.id, { jugadorId: j.id, equipoId: a.id, tipo: "gol" })).rejects.toMatchObject({ status: 422 });
    await csvc.marcar(cj.id, "convocado");
    const gol = await esvc.registrar(p.id, { jugadorId: j.id, equipoId: a.id, tipo: "gol" });
    expect(gol.tipo).toBe("gol");
    await psvc.cambiarEstado(p.id, "finalizado");
    const fix = await esvc.registrar(p.id, { jugadorId: k.id, equipoId: b.id, tipo: "autogol" });
    expect(fix.tipo).toBe("autogol");
  });
  it("gol en suspendido 422 y suspendido es terminal", async () => {
    const { ligas, equipos, jugadores, psvc, csvc, esvc } = setup();
    const liga = await ligas.create({ nombre: "L", formato: "liga" });
    const a = await equipos.create("A");
    const b = await equipos.create("B");
    const j = await jugadores.create("Juan");
    const p = await psvc.create({ ligaId: liga.id, localId: a.id, visitaId: b.id, fecha: "2026-03-01T15:00:00Z" });
    await csvc.convocar(p.id, j.id, a.id);
    const susp = await psvc.cambiarEstado(p.id, "suspendido");
    expect(susp.estado).toBe("suspendido");
    await expect(esvc.registrar(p.id, { jugadorId: j.id, equipoId: a.id, tipo: "gol" })).rejects.toMatchObject({ status: 422 });
    await expect(psvc.cambiarEstado(p.id, "programado")).rejects.toMatchObject({ status: 422 });
    await expect(psvc.cambiarEstado(p.id, "en_juego")).rejects.toMatchObject({ status: 422 });
  });
});
