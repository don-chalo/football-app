import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app";
import { FakeAsignaciones, FakeConvocatorias, FakeEquipos, FakeEventos, FakeJugadores, FakeLigas, FakePartidos, FakeUsers, resetIds } from "../testing/fakes";

const ID_INEXISTENTE = "666666666666666666666666";

function build() {
  resetIds();
  const cast = (x: unknown) => x as never;
  const equipos = new FakeEquipos();
  const jugadores = new FakeJugadores();
  const app = createApp({
    users: cast(new FakeUsers()),
    ligas: cast(new FakeLigas()),
    equipos: cast(equipos),
    jugadores: cast(jugadores),
    partidos: cast(new FakePartidos()),
    convocatorias: cast(new FakeConvocatorias()),
    eventos: cast(new FakeEventos()),
    asignaciones: cast(new FakeAsignaciones()),
  });
  return { app, equipos, jugadores };
}

describe("POST /jugadores/buscar y /equipos/buscar", () => {
  let ctx: ReturnType<typeof build>;
  beforeEach(() => { ctx = build(); });

  it("jugadores: devuelve {id,nombre} de los ids pedidos, sin auth", async () => {
    const a = await ctx.jugadores.create("Ana");
    await ctx.jugadores.create("Otro");
    const r = await request(ctx.app).post("/jugadores/buscar").send({ ids: [a.id, ID_INEXISTENTE] }).expect(200);
    expect(r.body).toEqual([{ id: a.id, nombre: "Ana" }]);
  });

  it("equipos: devuelve {id,nombre} de los ids pedidos", async () => {
    const e = await ctx.equipos.create("Rojos");
    const r = await request(ctx.app).post("/equipos/buscar").send({ ids: [e.id] }).expect(200);
    expect(r.body).toEqual([{ id: e.id, nombre: "Rojos" }]);
  });

  it("ids vacios -> []", async () => {
    await request(ctx.app).post("/jugadores/buscar").send({ ids: [] }).expect(200, []);
    await request(ctx.app).post("/equipos/buscar").send({ ids: [] }).expect(200, []);
  });

  it("id invalido -> 422 (zod)", async () => {
    await request(ctx.app).post("/equipos/buscar").send({ ids: ["no-es-id"] }).expect(422);
  });

  it("mas de 100 ids -> 422", async () => {
    const ids = Array.from({ length: 101 }, () => ID_INEXISTENTE);
    await request(ctx.app).post("/jugadores/buscar").send({ ids }).expect(422);
  });

  it("body sin ids -> 422", async () => {
    await request(ctx.app).post("/jugadores/buscar").send({}).expect(422);
  });
});
