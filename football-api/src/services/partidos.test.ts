import { beforeEach, describe, expect, it } from "vitest";
import { FakeConvocatorias, FakeEquipos, FakeEventos, FakeLigas, FakePartidos, resetIds } from "../testing/fakes";
import { createPartidosService } from "./partidos.service";
import type { MongooseLigasRepo, MongooseEquiposRepo } from "../repositories/catalogos.repository";
import type { MongooseConvocatoriasRepo, MongooseEventosRepo } from "../repositories/match.repository";
import type { MongoosePartidosRepo } from "../repositories/partidos.repository";

function setup() {
  const convocatorias = new FakeConvocatorias();
  const ligas = new FakeLigas() as unknown as MongooseLigasRepo;
  const equipos = new FakeEquipos() as unknown as MongooseEquiposRepo;
  const partidos = new FakePartidos() as unknown as MongoosePartidosRepo;
  const eventos = new FakeEventos() as unknown as MongooseEventosRepo;
  const svc = createPartidosService({
    partidos,
    ligas,
    equipos,
    convocatorias: convocatorias as unknown as MongooseConvocatoriasRepo,
    eventos,
  });
  return { ligas: ligas as unknown as FakeLigas, equipos: equipos as unknown as FakeEquipos, partidos, eventos: eventos as unknown as FakeEventos, svc, convocatorias };
}

describe("partidos", () => {
  beforeEach(() => resetIds());
  it("crea con estado programado por defecto y rechaza mismo equipo 422", async () => {
    const { ligas, equipos, svc } = setup();
    const liga = await (ligas as unknown as { create(d: never): Promise<{ id: string }> }).create({ nombre: "L", formato: "liga" } as never);
    const a = await equipos.create("A");
    const b = await equipos.create("B");
    const p = await svc.create({ ligaId: liga.id, localId: a.id, visitaId: b.id, fecha: "2026-03-01T15:00:00Z" });
    expect(p.estado).toBe("programado");
    await expect(svc.create({ ligaId: liga.id, localId: a.id, visitaId: a.id, fecha: "2026-03-01T15:00:00Z" })).rejects.toMatchObject({ status: 422 });
  });
  it("liga inexistente 404", async () => {
    const { equipos, svc } = setup();
    const a = await equipos.create("A");
    const b = await equipos.create("B");
    await expect(
      svc.create({ ligaId: "000000000000000000000099", localId: a.id, visitaId: b.id, fecha: "2026-03-01T15:00:00Z" }),
    ).rejects.toMatchObject({ status: 404 });
  });
  it("transiciones: avanza y rechaza volver a programado", async () => {
    const { ligas, equipos, svc } = setup();
    const liga = await (ligas as unknown as { create(d: never): Promise<{ id: string }> }).create({ nombre: "L", formato: "liga" } as never);
    const a = await equipos.create("A");
    const b = await equipos.create("B");
    const p = await svc.create({ ligaId: liga.id, localId: a.id, visitaId: b.id, fecha: "2026-03-01T15:00:00Z" });
    expect((await svc.cambiarEstado(p.id, "en_juego")).estado).toBe("en_juego");
    await expect(svc.cambiarEstado(p.id, "programado")).rejects.toMatchObject({ status: 422 });
    expect((await svc.cambiarEstado(p.id, "finalizado")).estado).toBe("finalizado");
  });
  it("penales: valida entero>=0 y clasificado local|visita", async () => {
    const { ligas, equipos, svc } = setup();
    const liga = await (ligas as unknown as { create(d: never): Promise<{ id: string }> }).create({ nombre: "C", formato: "copa" } as never);
    const a = await equipos.create("A");
    const b = await equipos.create("B");
    const p = await svc.create({ ligaId: liga.id, localId: a.id, visitaId: b.id, fecha: "2026-03-01T15:00:00Z" });
    const upd = await svc.actualizar(p.id, { penalesLocal: 4, penalesVisita: 3, clasificadoId: a.id });
    expect(upd.penalesLocal).toBe(4);
    await expect(svc.actualizar(p.id, { penalesLocal: -1 })).rejects.toMatchObject({ status: 422 });
    await expect(svc.actualizar(p.id, { clasificadoId: "000000000000000000000099" })).rejects.toMatchObject({ status: 422 });
  });
  it("listado: gol y penal en juego calculan 1-1", async () => {
    const { ligas, equipos, eventos, svc } = setup();
    const liga = await (ligas as unknown as { create(d: never): Promise<{ id: string }> }).create({ nombre: "L", formato: "liga" } as never);
    const a = await equipos.create("A");
    const b = await equipos.create("B");
    const p = await svc.create({ ligaId: liga.id, localId: a.id, visitaId: b.id, fecha: "2026-03-01T15:00:00Z" });
    await eventos.create({ partidoId: p.id, jugadorId: "j1", equipoId: a.id, tipo: "gol", minuto: 10 });
    await eventos.create({ partidoId: p.id, jugadorId: "j2", equipoId: b.id, tipo: "penal", minuto: 20 });
    const [row] = await svc.list({ ligaId: liga.id });
    expect(row).toMatchObject({ id: p.id, marcador: { local: 1, visita: 1 } });
  });
  it("listado: autogol local suma a la visita", async () => {
    const { ligas, equipos, eventos, svc } = setup();
    const liga = await (ligas as unknown as { create(d: never): Promise<{ id: string }> }).create({ nombre: "L", formato: "liga" } as never);
    const a = await equipos.create("A");
    const b = await equipos.create("B");
    const p = await svc.create({ ligaId: liga.id, localId: a.id, visitaId: b.id, fecha: "2026-03-01T15:00:00Z" });
    await eventos.create({ partidoId: p.id, jugadorId: "j1", equipoId: a.id, tipo: "autogol", minuto: 33 });
    const [row] = await svc.list({ ligaId: liga.id });
    expect(row).toMatchObject({ id: p.id, marcador: { local: 0, visita: 1 } });
  });
  it("listado: sin eventos es 0-0 y refleja ediciones y borrados", async () => {
    const { ligas, equipos, eventos, svc } = setup();
    const liga = await (ligas as unknown as { create(d: never): Promise<{ id: string }> }).create({ nombre: "L", formato: "liga" } as never);
    const a = await equipos.create("A");
    const b = await equipos.create("B");
    const p = await svc.create({ ligaId: liga.id, localId: a.id, visitaId: b.id, fecha: "2026-03-01T15:00:00Z" });
    const [vacio] = await svc.list({ ligaId: liga.id });
    expect(vacio).toMatchObject({ id: p.id, marcador: { local: 0, visita: 0 } });

    const gol = await eventos.create({ partidoId: p.id, jugadorId: "j1", equipoId: a.id, tipo: "gol", minuto: 5 });
    const [conGol] = await svc.list({ ligaId: liga.id });
    expect(conGol).toMatchObject({ id: p.id, marcador: { local: 1, visita: 0 } });

    await eventos.update(gol.id, { equipoId: b.id });
    const [editado] = await svc.list({ ligaId: liga.id });
    expect(editado).toMatchObject({ id: p.id, marcador: { local: 0, visita: 1 } });

    await eventos.remove(gol.id);
    const [borrado] = await svc.list({ ligaId: liga.id });
    expect(borrado).toMatchObject({ id: p.id, marcador: { local: 0, visita: 0 } });
  });
  it("listado: penales de definición no alteran el marcador", async () => {
    const { ligas, equipos, svc } = setup();
    const liga = await (ligas as unknown as { create(d: never): Promise<{ id: string }> }).create({ nombre: "C", formato: "copa" } as never);
    const a = await equipos.create("A");
    const b = await equipos.create("B");
    const p = await svc.create({ ligaId: liga.id, localId: a.id, visitaId: b.id, fecha: "2026-03-01T15:00:00Z" });
    await svc.actualizar(p.id, { penalesLocal: 4, penalesVisita: 3, clasificadoId: a.id });
    const [row] = await svc.list({ ligaId: liga.id });
    expect(row).toMatchObject({
      id: p.id,
      marcador: { local: 0, visita: 0 },
      penalesLocal: 4,
      penalesVisita: 3,
    });
  });
});
  it("cronometro: iniciar setea inicioEn y finalizar setea finEn", async () => {
    const { ligas, equipos, svc } = setup();
    const liga = await (ligas as unknown as { create(d: never): Promise<{ id: string }> }).create({ nombre: "L", formato: "liga" } as never);
    const a = await equipos.create("A");
    const b = await equipos.create("B");
    const p = await svc.create({ ligaId: liga.id, localId: a.id, visitaId: b.id, fecha: "2026-03-01T15:00:00Z" });
    expect(p.inicioEn).toBeNull();
    const iniciado = await svc.cambiarEstado(p.id, "en_juego");
    expect(iniciado.inicioEn).toBeInstanceOf(Date);
    const fin = await svc.cambiarEstado(p.id, "finalizado");
    expect(fin.finEn).toBeInstanceOf(Date);
  });
  it("iniciar antes de fecha rechaza 400", async () => {
    const { ligas, equipos, svc } = setup();
    const liga = await (ligas as unknown as { create(d: never): Promise<{ id: string }> }).create({ nombre: "L", formato: "liga" } as never);
    const a = await equipos.create("A");
    const b = await equipos.create("B");
    const futura = new Date(Date.now() + 3_600_000).toISOString();
    const p = await svc.create({ ligaId: liga.id, localId: a.id, visitaId: b.id, fecha: futura });
    await expect(svc.cambiarEstado(p.id, "en_juego")).rejects.toMatchObject({ status: 400 });
  });
  it("doble inicio no resetea inicioEn", async () => {
    const { ligas, equipos, svc } = setup();
    const liga = await (ligas as unknown as { create(d: never): Promise<{ id: string }> }).create({ nombre: "L", formato: "liga" } as never);
    const a = await equipos.create("A");
    const b = await equipos.create("B");
    const p = await svc.create({ ligaId: liga.id, localId: a.id, visitaId: b.id, fecha: "2026-03-01T15:00:00Z" });
    const primero = await svc.cambiarEstado(p.id, "en_juego");
    await expect(svc.cambiarEstado(p.id, "en_juego")).rejects.toMatchObject({ status: 422 });
    expect(primero.inicioEn).toBeInstanceOf(Date);
  });
  it("pausa y reanuda solo en juego y acumula", async () => {
    const { ligas, equipos, svc } = setup();
    const liga = await (ligas as unknown as { create(d: never): Promise<{ id: string }> }).create({ nombre: "L", formato: "liga" } as never);
    const a = await equipos.create("A");
    const b = await equipos.create("B");
    const p = await svc.create({ ligaId: liga.id, localId: a.id, visitaId: b.id, fecha: "2026-03-01T15:00:00Z" });
    await expect(svc.pausa(p.id, true)).rejects.toMatchObject({ status: 422 });
    await svc.cambiarEstado(p.id, "en_juego");
    const pausado = await svc.pausa(p.id, true);
    expect(pausado.pausaDesde).toBeInstanceOf(Date);
    const reanudado = await svc.pausa(p.id, false);
    expect(reanudado.pausaDesde).toBeNull();
    expect(reanudado.pausaAcumSeg).toBeGreaterThanOrEqual(0);
  });

describe("MVP del partido", () => {
  beforeEach(() => resetIds());

  async function partidoConConvocados() {
    const env = setup();
    const liga = await (env.ligas as unknown as { create(d: never): Promise<{ id: string }> }).create({ nombre: "L", formato: "liga" } as never);
    const a = await env.equipos.create("A");
    const b = await env.equipos.create("B");
    const p = await env.svc.create({ ligaId: liga.id, localId: a.id, visitaId: b.id, fecha: "2026-03-01T15:00:00Z" });
    const convocado = "000000000000000000000101";
    const ausente = "000000000000000000000102";
    await env.convocatorias.create({ partidoId: p.id, jugadorId: convocado, equipoId: a.id, estado: "convocado" } as never);
    await env.convocatorias.create({ partidoId: p.id, jugadorId: ausente, equipoId: b.id, estado: "ausente" } as never);
    return { ...env, partido: p, convocado, ausente };
  }

  it("asigna el MVP a un convocado en partido finalizado", async () => {
    const { svc, partido, convocado } = await partidoConConvocados();
    await svc.cambiarEstado(partido.id, "en_juego");
    await svc.cambiarEstado(partido.id, "finalizado");
    const r = await svc.registrarMvp(partido.id, convocado);
    expect(r.mvpJugadorId).toBe(convocado);
    const detalle = await svc.detalle(partido.id);
    expect(detalle.mvpJugadorId).toBe(convocado);
  });

  it("el último MVP guardado reemplaza al anterior", async () => {
    const { svc, partido, convocado, convocatorias } = await partidoConConvocados();
    await svc.cambiarEstado(partido.id, "en_juego");
    await svc.cambiarEstado(partido.id, "finalizado");
    const otro = "000000000000000000000103";
    await convocatorias.create({ partidoId: partido.id, jugadorId: otro, equipoId: partido.localId, estado: "convocado" } as never);
    await svc.registrarMvp(partido.id, convocado);
    const r = await svc.registrarMvp(partido.id, otro);
    expect(r.mvpJugadorId).toBe(otro);
  });

  it("quitar el MVP deja el partido sin MVP", async () => {
    const { svc, partido, convocado } = await partidoConConvocados();
    await svc.cambiarEstado(partido.id, "en_juego");
    await svc.cambiarEstado(partido.id, "finalizado");
    await svc.registrarMvp(partido.id, convocado);
    const r = await svc.registrarMvp(partido.id, null);
    expect(r.mvpJugadorId).toBeNull();
  });

  it("rechaza el MVP si el partido no está finalizado (422 con mensaje)", async () => {
    const { svc, partido, convocado } = await partidoConConvocados();
    await expect(svc.registrarMvp(partido.id, convocado)).rejects.toMatchObject({
      status: 422,
      message: "Solo se puede registrar el MVP de un partido finalizado.",
    });
  });

  it("rechaza un jugador ausente (422 con mensaje)", async () => {
    const { svc, partido, ausente } = await partidoConConvocados();
    await svc.cambiarEstado(partido.id, "en_juego");
    await svc.cambiarEstado(partido.id, "finalizado");
    await expect(svc.registrarMvp(partido.id, ausente)).rejects.toMatchObject({
      status: 422,
      message: "Un jugador ausente no puede ser MVP.",
    });
  });

  it("rechaza un jugador no convocado (422 con mensaje)", async () => {
    const { svc, partido } = await partidoConConvocados();
    await svc.cambiarEstado(partido.id, "en_juego");
    await svc.cambiarEstado(partido.id, "finalizado");
    await expect(svc.registrarMvp(partido.id, "000000000000000000000999")).rejects.toMatchObject({
      status: 422,
      message: "Solo se puede elegir como MVP a un jugador convocado al partido.",
    });
  });

  it("partido inexistente 404", async () => {
    const { svc } = setup();
    await expect(svc.registrarMvp("000000000000000000000099", null)).rejects.toMatchObject({ status: 404 });
  });
});
