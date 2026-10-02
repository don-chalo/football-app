import { describe, expect, it } from "vitest";
import type { HttpClient } from "./http";
import { createServices } from "./services";

interface Llamada {
  metodo: string;
  path: string;
  body?: unknown;
}

function fakeHttp(respuesta: unknown = {}): { http: HttpClient; llamadas: Llamada[] } {
  const llamadas: Llamada[] = [];
  const http: HttpClient = {
    get: <T>(path: string): Promise<T> => {
      llamadas.push({ metodo: "GET", path });
      return Promise.resolve(respuesta as T);
    },
    post: <T>(path: string, data?: unknown): Promise<T> => {
      llamadas.push({ metodo: "POST", path, body: data });
      return Promise.resolve(respuesta as T);
    },
    put: <T>(path: string, data: unknown): Promise<T> => {
      llamadas.push({ metodo: "PUT", path, body: data });
      return Promise.resolve(respuesta as T);
    },
    patch: <T>(path: string, data: unknown): Promise<T> => {
      llamadas.push({ metodo: "PATCH", path, body: data });
      return Promise.resolve(respuesta as T);
    },
    del: (path: string): Promise<void> => {
      llamadas.push({ metodo: "DELETE", path });
      return Promise.resolve();
    },
  };
  return { http, llamadas };
}

function setup(respuesta: unknown = {}) {
  const { http, llamadas } = fakeHttp(respuesta);
  return { s: createServices(http), llamadas };
}

describe("servicios de dominio", () => {
  it("auth.login usa POST /auth/login", async () => {
    const { s, llamadas } = setup();
    await s.auth.login({ username: "u", password: "p" });
    expect(llamadas).toEqual([{ metodo: "POST", path: "/auth/login", body: { username: "u", password: "p" } }]);
  });

  it("ligas: listar/obtener/crear/borrar", async () => {
    const { s, llamadas } = setup();
    await s.ligas.listar();
    await s.ligas.obtener("l1");
    await s.ligas.crear({ nombre: "A", formato: "copa", idaVuelta: true });
    await s.ligas.borrar("l1");
    expect(llamadas).toEqual([
      { metodo: "GET", path: "/ligas" },
      { metodo: "GET", path: "/ligas/l1" },
      { metodo: "POST", path: "/ligas", body: { nombre: "A", formato: "copa", idaVuelta: true } },
      { metodo: "DELETE", path: "/ligas/l1" },
    ]);
  });

  it("equipos y jugadores: CRUD y bulk", async () => {
    const { s, llamadas } = setup();
    await s.equipos.listar();
    await s.equipos.crear("E");
    await s.equipos.borrar("e1");
    await s.jugadores.listar();
    await s.jugadores.crear("J");
    await s.jugadores.crearVarios(["A", "B"]);
    await s.jugadores.borrar("j1");
    expect(llamadas).toEqual([
      { metodo: "GET", path: "/equipos" },
      { metodo: "POST", path: "/equipos", body: { nombre: "E" } },
      { metodo: "DELETE", path: "/equipos/e1" },
      { metodo: "GET", path: "/jugadores" },
      { metodo: "POST", path: "/jugadores", body: { nombre: "J" } },
      { metodo: "POST", path: "/jugadores/bulk", body: { nombres: ["A", "B"] } },
      { metodo: "DELETE", path: "/jugadores/j1" },
    ]);
  });

  it("usuarios y asignaciones", async () => {
    const { s, llamadas } = setup();
    await s.usuarios.listar();
    await s.usuarios.crear({ username: "u", password: "p", role: "admin_partidos" });
    await s.asignaciones.porLiga("l1");
    await s.asignaciones.asignar("l1", "u1");
    await s.asignaciones.quitar("l1", "u1");
    expect(llamadas).toEqual([
      { metodo: "GET", path: "/usuarios" },
      { metodo: "POST", path: "/usuarios", body: { username: "u", password: "p", role: "admin_partidos" } },
      { metodo: "GET", path: "/ligas/l1/admins" },
      { metodo: "POST", path: "/ligas/l1/admins", body: { userId: "u1" } },
      { metodo: "DELETE", path: "/ligas/l1/admins/u1" },
    ]);
  });

  it("partidos: lista por liga, detalle, crear, estado y penales", async () => {
    const { s, llamadas } = setup();
    await s.partidos.porLiga("l1");
    await s.partidos.detalle("p1");
    await s.partidos.crear({ ligaId: "l1", localId: "a", visitaId: "b", fecha: "f", fase: "fase 1" });
    await s.partidos.cambiarEstado("p1", "en_juego");
    await s.partidos.actualizarPenales("p1", { penalesLocal: 4, penalesVisita: 3, clasificadoId: "a" });
    await s.partidos.pausa("p1", true);
    expect(llamadas).toEqual([
      { metodo: "GET", path: "/partidos?ligaId=l1" },
      { metodo: "GET", path: "/partidos/p1" },
      { metodo: "POST", path: "/partidos", body: { ligaId: "l1", localId: "a", visitaId: "b", fecha: "f", fase: "fase 1" } },
      { metodo: "PATCH", path: "/partidos/p1/estado", body: { estado: "en_juego" } },
      { metodo: "PATCH", path: "/partidos/p1", body: { penalesLocal: 4, penalesVisita: 3, clasificadoId: "a" } },
      { metodo: "POST", path: "/partidos/p1/pausa", body: { pausada: true } },
    ]);
  });

  it("convocatorias y eventos", async () => {
    const { s, llamadas } = setup();
    await s.convocatorias.agregar("p1", { jugadorId: "j1", equipoId: "e1" });
    await s.convocatorias.marcar("c1", "ausente");
    await s.convocatorias.quitar("c1");
    await s.eventos.registrar("p1", { jugadorId: "j1", equipoId: "e1", tipo: "gol", minuto: 10 });
    await s.eventos.eliminar("ev1");
    expect(llamadas).toEqual([
      { metodo: "POST", path: "/partidos/p1/convocatorias", body: { jugadorId: "j1", equipoId: "e1" } },
      { metodo: "PATCH", path: "/convocatorias/c1", body: { estado: "ausente" } },
      { metodo: "DELETE", path: "/convocatorias/c1" },
      { metodo: "POST", path: "/partidos/p1/eventos", body: { jugadorId: "j1", equipoId: "e1", tipo: "gol", minuto: 10 } },
      { metodo: "DELETE", path: "/eventos/ev1" },
    ]);
  });

  it("estadísticas: rangos, por liga y enfrentamiento", async () => {
    const { s, llamadas } = setup();
    await s.estadisticas.porEquipos({ desde: "2026-01-01", hasta: "2026-12-31" });
    await s.estadisticas.porJugadores({ desde: "2026-01-01", hasta: "2026-12-31" });
    await s.estadisticas.porLigaEquipos("l1");
    await s.estadisticas.porLigaJugadores("l1");
    await s.estadisticas.enfrentamiento("a", "b");
    expect(llamadas).toEqual([
      { metodo: "GET", path: "/estadisticas/equipos?desde=2026-01-01&hasta=2026-12-31" },
      { metodo: "GET", path: "/estadisticas/jugadores?desde=2026-01-01&hasta=2026-12-31" },
      { metodo: "GET", path: "/estadisticas/equipos?liga_ids=l1" },
      { metodo: "GET", path: "/estadisticas/jugadores?liga_ids=l1" },
      { metodo: "GET", path: "/estadisticas/enfrentamientos?equipo_a=a&equipo_b=b" },
    ]);
  });
});
