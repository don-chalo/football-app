import bcrypt from "bcryptjs";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app";
import { FakeAsignaciones, FakeConvocatorias, FakeEquipos, FakeEventos, FakeJugadores, FakeLigas, FakePartidos, FakeUsers, resetIds } from "../testing/fakes";

function build() {
  resetIds();
  const users = new FakeUsers();
  const cast = (x: unknown) => x as never;
  const app = createApp({
    users: cast(users),
    ligas: cast(new FakeLigas()),
    equipos: cast(new FakeEquipos()),
    jugadores: cast(new FakeJugadores()),
    partidos: cast(new FakePartidos()),
    convocatorias: cast(new FakeConvocatorias()),
    eventos: cast(new FakeEventos()),
    asignaciones: cast(new FakeAsignaciones()),
  });
  return { app, users };
}

describe("matriz de permisos + flujo barrial", () => {
  let app: ReturnType<typeof createApp>;
  let users: FakeUsers;

  beforeEach(async () => {
    ({ app, users } = build());
    await users.create({ username: "super", passwordHash: bcrypt.hashSync("super123", 4), role: "admin_usuarios" });
    await users.create({ username: "plan", passwordHash: bcrypt.hashSync("plan1234", 4), role: "admin_partidos" });
  });

  async function login(username: string, password: string): Promise<string> {
    const r = await request(app).post("/auth/login").send({ username, password }).expect(200);
    return r.body.token as string;
  }

  it("GET publico 200 anonimo; POST anonimo 401", async () => {
    await request(app).get("/ligas").expect(200);
    await request(app).get("/partidos").expect(200);
    await request(app).get("/estadisticas/equipos").expect(200);
    await request(app).post("/ligas").send({ nombre: "X", formato: "liga" }).expect(401);
  });

  it("admin_partidos 403 en /usuarios; admin_usuarios crea 201", async () => {
    const tPlan = await login("plan", "plan1234");
    await request(app).post("/usuarios").set("Authorization", `Bearer ${tPlan}`)
      .send({ username: "nuevo", password: "abcd", role: "admin_partidos" }).expect(403);
    const tSuper = await login("super", "super123");
    const r = await request(app).post("/usuarios").set("Authorization", `Bearer ${tSuper}`)
      .send({ username: "nuevo", password: "abcd", role: "admin_partidos" }).expect(201);
    expect(r.body).not.toHaveProperty("passwordHash");
  });

  it("flujo completo: liga -> equipos -> jugadores -> partido -> en_juego -> goles -> finalizado -> stats", async () => {
    const t = await login("plan", "plan1234");
    const auth = { Authorization: `Bearer ${t}` };

    const liga = (await request(app).post("/ligas").set(auth).send({ nombre: "Apertura 2026", formato: "liga" }).expect(201)).body as { id: string };
    const a = (await request(app).post("/equipos").set(auth).send({ nombre: "Los Pibes" }).expect(201)).body as { id: string };
    const b = (await request(app).post("/equipos").set(auth).send({ nombre: "La 14" }).expect(201)).body as { id: string };
    const bulk = (await request(app).post("/jugadores/bulk").set(auth).send({ nombres: ["Juan Perez", "Pedro Gomez", "Juan Perez"] }).expect(201)).body as {
      creados: Array<{ id: string; nombre: string }>; errores: unknown[];
    };
    expect(bulk.creados).toHaveLength(2);
    expect(bulk.errores).toHaveLength(1);
    const [juan, pedro] = bulk.creados as Array<{ id: string }>;

    // mismo equipo 422
    await request(app).post("/partidos").set(auth)
      .send({ ligaId: liga.id, localId: a.id, visitaId: a.id, fecha: "2026-03-01T15:00:00Z" }).expect(422);

    const partido = (await request(app).post("/partidos").set(auth)
      .send({ ligaId: liga.id, localId: a.id, visitaId: b.id, fecha: "2026-03-01T15:00:00Z", fase: "fecha 1" }).expect(201)).body as { id: string; estado: string };
    expect(partido.estado).toBe("programado");

    // gol en programado 422
    await request(app).post(`/partidos/${partido.id}/convocatorias`).set(auth).send({ jugadorId: juan!.id, equipoId: a.id }).expect(201);
    await request(app).post(`/partidos/${partido.id}/convocatorias`).set(auth).send({ jugadorId: pedro!.id, equipoId: b.id }).expect(201);
    await request(app).post(`/partidos/${partido.id}/eventos`).set(auth)
      .send({ jugadorId: juan!.id, equipoId: a.id, tipo: "gol" }).expect(422);

    await request(app).patch(`/partidos/${partido.id}/estado`).set(auth).send({ estado: "en_juego" }).expect(200);
    // volver a programado 422
    await request(app).patch(`/partidos/${partido.id}/estado`).set(auth).send({ estado: "programado" }).expect(422);

    await request(app).post(`/partidos/${partido.id}/eventos`).set(auth)
      .send({ jugadorId: juan!.id, equipoId: a.id, tipo: "gol" }).expect(201);
    await request(app).post(`/partidos/${partido.id}/eventos`).set(auth)
      .send({ jugadorId: pedro!.id, equipoId: b.id, tipo: "penal" }).expect(201);
    await request(app).patch(`/partidos/${partido.id}/estado`).set(auth).send({ estado: "finalizado" }).expect(200);

    const det = (await request(app).get(`/partidos/${partido.id}`).expect(200)).body as { marcador: { local: number; visita: number } };
    expect(det.marcador).toEqual({ local: 1, visita: 1 });

    const lista = (await request(app).get(`/partidos?ligaId=${liga.id}`).expect(200)).body as Array<{
      id: string;
      estado: string;
      marcador: { local: number; visita: number };
    }>;
    expect(lista).toHaveLength(1);
    expect(lista[0]).toMatchObject({ id: partido.id, estado: "finalizado", marcador: { local: 1, visita: 1 } });

    const tabla = (await request(app).get("/estadisticas/equipos").expect(200)).body as Array<{ pts: number; pe: number }>;
    expect(tabla).toHaveLength(2);
    expect(tabla[0]).toMatchObject({ pts: 1, pe: 1 });

    const goleadores = (await request(app).get("/estadisticas/jugadores").expect(200)).body as Array<{ goles: number }>;
    expect(goleadores.reduce((n, g) => n + g.goles, 0)).toBe(2);

    const hist = (await request(app).get(`/estadisticas/enfrentamientos?equipo_a=${a.id}&equipo_b=${b.id}`).expect(200)).body as { pj: number; emp: number };
    expect(hist).toMatchObject({ pj: 1, emp: 1 });

    // rango > 1 ano 422
    await request(app).get("/estadisticas/equipos?desde=2024-01-01&hasta=2026-12-31").expect(422);
  });

  it("scope por liga: asignado 201, no asignado 403, 0 ligas 403", async () => {
    const tSuper = await login("super", "super123");
    const tPlan = await login("plan", "plan1234");
    const authPlan = { Authorization: `Bearer ${tPlan}` };
    const authSuper = { Authorization: `Bearer ${tSuper}` };

    const ligaA = (await request(app).post("/ligas").set(authSuper).send({ nombre: "A", formato: "liga" }).expect(201)).body as { id: string };
    const ligaB = (await request(app).post("/ligas").set(authSuper).send({ nombre: "B", formato: "liga" }).expect(201)).body as { id: string };
    const b = ligaB;

    // plan sin ligas no puede escribir
    const eq = (await request(app).post("/equipos").set(authPlan).send({ nombre: "X" }).expect(201)).body as { id: string };
    await request(app).post("/partidos").set(authPlan)
      .send({ ligaId: ligaA.id, localId: eq.id, visitaId: eq.id, fecha: "2026-03-01T15:00:00Z" }).expect(403);

    // super asigna plan a liga A (201), duplicada 409, admin_partidos no puede asignar 403
    const me = (await request(app).post("/auth/login").send({ username: "plan", password: "plan1234" }).expect(200)).body as {
      user: { id: string }; misLigas: string[];
    };
    expect(me.misLigas).toEqual([]);
    await request(app).post(`/ligas/${ligaA.id}/admins`).set(authPlan).send({ userId: me.user.id }).expect(403);
    await request(app).post(`/ligas/${ligaA.id}/admins`).set(authSuper).send({ userId: me.user.id }).expect(201);
    await request(app).post(`/ligas/${ligaA.id}/admins`).set(authSuper).send({ userId: me.user.id }).expect(409);

    const me2 = (await request(app).post("/auth/login").send({ username: "plan", password: "plan1234" }).expect(200)).body as { misLigas: string[] };
    expect(me2.misLigas).toEqual([ligaA.id]);

    // asignado en A: mismo equipo da 422 de negocio (pasó el scope)
    await request(app).post("/partidos").set(authPlan)
      .send({ ligaId: ligaA.id, localId: eq.id, visitaId: eq.id, fecha: "2026-03-01T15:00:00Z" }).expect(422);
    // no asignado en B: 403
    await request(app).post("/partidos").set(authPlan)
      .send({ ligaId: b.id, localId: eq.id, visitaId: eq.id, fecha: "2026-03-01T15:00:00Z" }).expect(403);

    // quitar último admin 422; con dos, permite
    await request(app).delete(`/ligas/${ligaA.id}/admins/${me.user.id}`).set(authSuper).expect(422);
    const u2 = (await request(app).post("/usuarios").set(authSuper)
      .send({ username: "plan2", password: "abcd", role: "admin_partidos" }).expect(201)).body as { id: string };
    await request(app).post(`/ligas/${ligaA.id}/admins`).set(authSuper).send({ userId: u2.id }).expect(201);
    await request(app).delete(`/ligas/${ligaA.id}/admins/${me.user.id}`).set(authSuper).expect(204);
  });

  it("auditoría: createdBy en liga/partido/evento y null legacy", async () => {
    const tPlan = await login("plan", "plan1234");
    const auth = { Authorization: `Bearer ${tPlan}` };

    const liga = (await request(app).post("/ligas").set(auth).send({ nombre: "L", formato: "liga" }).expect(201)).body as { id: string; createdBy: { username: string } };
    expect(liga.createdBy.username).toBe("plan");

    const det = (await request(app).get(`/ligas/${liga.id}`).expect(200)).body as { createdBy: { username: string } };
    expect(det.createdBy.username).toBe("plan");

    const a = (await request(app).post("/equipos").set(auth).send({ nombre: "A" }).expect(201)).body as { id: string };
    const b = (await request(app).post("/equipos").set(auth).send({ nombre: "B" }).expect(201)).body as { id: string };
    const j = (await request(app).post("/jugadores").set(auth).send({ nombre: "J" }).expect(201)).body as { id: string };
    const p = (await request(app).post("/partidos").set(auth)
      .send({ ligaId: liga.id, localId: a.id, visitaId: b.id, fecha: "2026-03-01T15:00:00Z" }).expect(201)).body as { id: string; createdBy: { username: string } };
    expect(p.createdBy.username).toBe("plan");

    await request(app).post(`/partidos/${p.id}/convocatorias`).set(auth).send({ jugadorId: j.id, equipoId: a.id }).expect(201);
    await request(app).patch(`/partidos/${p.id}/estado`).set(auth).send({ estado: "en_juego" }).expect(200);
    await request(app).post(`/partidos/${p.id}/eventos`).set(auth)
      .send({ jugadorId: j.id, equipoId: a.id, tipo: "gol" }).expect(201);

    const ficha = (await request(app).get(`/partidos/${p.id}`).expect(200)).body as {
      createdBy: { username: string };
      eventos: Array<{ createdBy: { username: string }; tipo: string }>;
      convocatorias: Array<{ createdBy: { username: string } }>;
    };
    expect(ficha.createdBy.username).toBe("plan");
    expect(ficha.eventos[0]).toMatchObject({ tipo: "gol", createdBy: { username: "plan" } });
    expect(ficha.convocatorias[0]!.createdBy.username).toBe("plan");
  });
});
