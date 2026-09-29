import { beforeEach, describe, expect, it } from "vitest";
import { FakeEquipos, FakeJugadores, FakeLigas, resetIds } from "../testing/fakes";
import { createLigasService } from "./ligas.service";
import { createEquiposService, createJugadoresService } from "./catalogos.service";
import type { MongooseEquiposRepo, MongooseJugadoresRepo, MongooseLigasRepo } from "../repositories/catalogos.repository";

beforeEach(() => resetIds());

describe("ligas", () => {
  it("crea liga y copa 201, formato invalido 400", async () => {
    const repo = new FakeLigas() as unknown as MongooseLigasRepo;
    const svc = createLigasService({ ligas: repo });
    expect((await svc.create({ nombre: "Apertura", formato: "liga" })).formato).toBe("liga");
    expect((await svc.create({ nombre: "Copa", formato: "copa", idaVuelta: true })).idaVuelta).toBe(true);
    await expect(svc.create({ nombre: "X", formato: "torneo" as never })).rejects.toMatchObject({ status: 400 });
  });
  it("liga fuerza idaVuelta=false", async () => {
    const repo = new FakeLigas() as unknown as MongooseLigasRepo;
    const l = await createLigasService({ ligas: repo }).create({ nombre: "A", formato: "liga", idaVuelta: true });
    expect(l.idaVuelta).toBe(false);
  });
});

describe("equipos", () => {
  it("crea 201 y duplicado case-insensitive 409", async () => {
    const repo = new FakeEquipos() as unknown as MongooseEquiposRepo;
    const svc = createEquiposService(repo);
    await svc.create("Los Pibes");
    await expect(svc.create("los pibes")).rejects.toMatchObject({ status: 409 });
  });
});

describe("jugadores bulk", () => {
  it("crea 3 ok y reporta duplicados sin rollback", async () => {
    const repo = new FakeJugadores() as unknown as MongooseJugadoresRepo;
    const svc = createJugadoresService(repo);
    await svc.create("Existente");
    const r = await svc.bulk(["Juan", "Pedro", "Existente", "juan", "  "]);
    expect(r.creados.map((j) => j.nombre)).toEqual(["Juan", "Pedro"]);
    expect(r.errores).toHaveLength(3);
  });
});
