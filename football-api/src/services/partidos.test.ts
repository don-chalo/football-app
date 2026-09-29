import { beforeEach, describe, expect, it } from "vitest";
import { FakeConvocatorias, FakeEquipos, FakeEventos, FakeLigas, FakePartidos, resetIds } from "../testing/fakes";
import { createPartidosService } from "./partidos.service";
import type { MongooseLigasRepo, MongooseEquiposRepo } from "../repositories/catalogos.repository";
import type { MongooseConvocatoriasRepo, MongooseEventosRepo } from "../repositories/match.repository";
import type { MongoosePartidosRepo } from "../repositories/partidos.repository";

function setup() {
  const ligas = new FakeLigas() as unknown as MongooseLigasRepo;
  const equipos = new FakeEquipos() as unknown as MongooseEquiposRepo;
  const partidos = new FakePartidos() as unknown as MongoosePartidosRepo;
  const svc = createPartidosService({
    partidos,
    ligas,
    equipos,
    convocatorias: new FakeConvocatorias() as unknown as MongooseConvocatoriasRepo,
    eventos: new FakeEventos() as unknown as MongooseEventosRepo,
  });
  return { ligas: ligas as unknown as FakeLigas, equipos: equipos as unknown as FakeEquipos, partidos, svc };
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
});
