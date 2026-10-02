/** Repositorios en memoria para tests (misma forma que los Mongoose). Solo uso en tests. */
import { uniqueKey } from "../domain/normalize";
import type {
  Asignacion,
  Convocatoria,
  CreatedBy,
  Equipo,
  Evento,
  Jugador,
  Liga,
  Partido,
  User,
} from "../repositories/types";

let seq = 0;
export function newId(): string {
  seq += 1;
  return seq.toString(16).padStart(24, "0");
}
export function resetIds(): void {
  seq = 1000;
}

function dup<T>(v: T): T {
  return structuredClone(v);
}

export class FakeUsers {
  items: User[] = [];
  async findById(id: string): Promise<User | null> {
    return this.items.find((u) => u.id === id) ?? null;
  }
  async findByUsername(nombre: string): Promise<User | null> {
    return this.items.find((u) => uniqueKey(u.username) === uniqueKey(nombre)) ?? null;
  }
  async list(): Promise<User[]> {
    return dup(this.items);
  }
  async create(data: { username: string; passwordHash: string; role: User["role"] }): Promise<User> {
    if (await this.findByUsername(data.username)) throw Object.assign(new Error("dup"), { code: 11000 });
    const u: User = { id: newId(), ...data };
    this.items.push(u);
    return dup(u);
  }
  async update(id: string, data: Partial<User>): Promise<User | null> {
    const i = this.items.findIndex((u) => u.id === id);
    if (i === -1) return null;
    this.items[i] = { ...this.items[i]!, ...data, id };
    return dup(this.items[i]!);
  }
  async remove(id: string): Promise<boolean> {
    const i = this.items.findIndex((u) => u.id === id);
    if (i === -1) return false;
    this.items.splice(i, 1);
    return true;
  }
}

function crud<T extends { id: string }>() {
  return class {
    items: T[] = [];
    async findById(id: string): Promise<T | null> {
      return this.items.find((x) => x.id === id) ?? null;
    }
    async list(): Promise<T[]> {
      return dup(this.items);
    }
    async remove(id: string): Promise<boolean> {
      const i = this.items.findIndex((x) => x.id === id);
      if (i === -1) return false;
      this.items.splice(i, 1);
      return true;
    }
  };
}

export class FakeLigas extends crud<Liga>() {
  async create(data: { nombre: string; formato: "liga" | "copa"; idaVuelta?: boolean; createdBy?: CreatedBy | null }): Promise<Liga> {
    const l: Liga = {
      id: newId(), nombre: data.nombre, formato: data.formato, idaVuelta: data.idaVuelta ?? false,
      createdBy: data.createdBy ?? null, createdAt: new Date(),
    };
    this.items.push(l);
    return dup(l);
  }
  async update(id: string, data: Partial<Liga>): Promise<Liga | null> {
    const i = this.items.findIndex((x) => x.id === id);
    if (i === -1) return null;
    this.items[i] = { ...this.items[i]!, ...data, id };
    return dup(this.items[i]!);
  }
}

export class FakeEquipos extends crud<Equipo>() {
  async findByNombre(nombre: string): Promise<Equipo | null> {
    return this.items.find((x) => uniqueKey(x.nombre) === uniqueKey(nombre)) ?? null;
  }
  async create(nombre: string): Promise<Equipo> {
    if (await this.findByNombre(nombre)) throw Object.assign(new Error("dup"), { code: 11000 });
    const e: Equipo = { id: newId(), nombre };
    this.items.push(e);
    return dup(e);
  }
  async update(id: string, nombre: string): Promise<Equipo | null> {
    const i = this.items.findIndex((x) => x.id === id);
    if (i === -1) return null;
    this.items[i] = { ...this.items[i]!, nombre, id };
    return dup(this.items[i]!);
  }
}

export class FakeJugadores extends crud<Jugador>() {
  async findByNombre(nombre: string): Promise<Jugador | null> {
    return this.items.find((x) => uniqueKey(x.nombre) === uniqueKey(nombre)) ?? null;
  }
  async create(nombre: string): Promise<Jugador> {
    if (await this.findByNombre(nombre)) throw Object.assign(new Error("dup"), { code: 11000 });
    const j: Jugador = { id: newId(), nombre };
    this.items.push(j);
    return dup(j);
  }
  async update(id: string, nombre: string): Promise<Jugador | null> {
    const i = this.items.findIndex((x) => x.id === id);
    if (i === -1) return null;
    this.items[i] = { ...this.items[i]!, nombre, id };
    return dup(this.items[i]!);
  }
}

export class FakePartidos extends crud<Partido>() {
  async list(filtro?: { ligaId?: string; estado?: Partido["estado"] }): Promise<Partido[]> {
    return dup(this.items.filter((p) => (!filtro?.ligaId || p.ligaId === filtro.ligaId) && (!filtro?.estado || p.estado === filtro.estado)));
  }
  async listByIds(ids: string[]): Promise<Partido[]> {
    return dup(this.items.filter((p) => ids.includes(p.id)));
  }
  async create(data: { ligaId: string; localId: string; visitaId: string; fecha: Date; fase?: string; idaDe?: string | null; createdBy?: CreatedBy | null }): Promise<Partido> {
    const p: Partido = {
      id: newId(), ligaId: data.ligaId, localId: data.localId, visitaId: data.visitaId,
      fecha: data.fecha, estado: "programado", fase: data.fase ?? "", idaDe: data.idaDe ?? null,
      penalesLocal: null, penalesVisita: null, clasificadoId: null,
      inicioEn: null, pausaDesde: null, pausaAcumSeg: 0, finEn: null,
      createdBy: data.createdBy ?? null, createdAt: new Date(),
    };
    this.items.push(p);
    return dup(p);
  }
  async update(id: string, data: Partial<Partido>): Promise<Partido | null> {
    const i = this.items.findIndex((x) => x.id === id);
    if (i === -1) return null;
    this.items[i] = { ...this.items[i]!, ...data, id };
    return dup(this.items[i]!);
  }
}

export class FakeConvocatorias {
  items: Convocatoria[] = [];
  async findById(id: string): Promise<Convocatoria | null> {
    return this.items.find((x) => x.id === id) ?? null;
  }
  async listByPartido(partidoId: string): Promise<Convocatoria[]> {
    return dup(this.items.filter((x) => x.partidoId === partidoId));
  }
  async listByPartidos(ids: string[]): Promise<Convocatoria[]> {
    return dup(this.items.filter((x) => ids.includes(x.partidoId)));
  }
  async findByPartidoJugador(partidoId: string, jugadorId: string): Promise<Convocatoria | null> {
    return this.items.find((x) => x.partidoId === partidoId && x.jugadorId === jugadorId) ?? null;
  }
  async create(data: Omit<Convocatoria, "id" | "createdAt" | "createdBy"> & { createdBy?: CreatedBy | null }): Promise<Convocatoria> {
    const c: Convocatoria = { ...data, createdBy: data.createdBy ?? null, createdAt: new Date(), id: newId() };
    this.items.push(c);
    return dup(c);
  }
  async update(id: string, estado: Convocatoria["estado"]): Promise<Convocatoria | null> {
    const i = this.items.findIndex((x) => x.id === id);
    if (i === -1) return null;
    this.items[i] = { ...this.items[i]!, estado, id };
    return dup(this.items[i]!);
  }
  async remove(id: string): Promise<boolean> {
    const i = this.items.findIndex((x) => x.id === id);
    if (i === -1) return false;
    this.items.splice(i, 1);
    return true;
  }
}

export class FakeAsignaciones {
  items: Asignacion[] = [];
  async listByLiga(ligaId: string): Promise<Asignacion[]> {
    return dup(this.items.filter((x) => x.ligaId === ligaId));
  }
  async listByUser(userId: string): Promise<Asignacion[]> {
    return dup(this.items.filter((x) => x.userId === userId));
  }
  async countByLiga(ligaId: string): Promise<number> {
    return this.items.filter((x) => x.ligaId === ligaId).length;
  }
  async exists(userId: string, ligaId: string): Promise<boolean> {
    return this.items.some((x) => x.userId === userId && x.ligaId === ligaId);
  }
  async create(userId: string, ligaId: string): Promise<Asignacion> {
    if (await this.exists(userId, ligaId)) throw Object.assign(new Error("dup"), { code: 11000 });
    const a: Asignacion = { id: newId(), userId, ligaId };
    this.items.push(a);
    return dup(a);
  }
  async remove(userId: string, ligaId: string): Promise<boolean> {
    const i = this.items.findIndex((x) => x.userId === userId && x.ligaId === ligaId);
    if (i === -1) return false;
    this.items.splice(i, 1);
    return true;
  }
  async removeByLiga(ligaId: string): Promise<number> {
    const n = this.items.filter((x) => x.ligaId === ligaId).length;
    this.items = this.items.filter((x) => x.ligaId !== ligaId);
    return n;
  }
}

export class FakeEventos {
  items: Evento[] = [];
  async findById(id: string): Promise<Evento | null> {
    return this.items.find((x) => x.id === id) ?? null;
  }
  async listByPartido(partidoId: string): Promise<Evento[]> {
    return dup(this.items.filter((x) => x.partidoId === partidoId));
  }
  async listByPartidos(ids: string[]): Promise<Evento[]> {
    return dup(this.items.filter((x) => ids.includes(x.partidoId)));
  }
  async create(data: Omit<Evento, "id" | "createdAt" | "createdBy"> & { createdBy?: CreatedBy | null }): Promise<Evento> {
    const e: Evento = { ...data, createdBy: data.createdBy ?? null, createdAt: new Date(), id: newId() };
    this.items.push(e);
    return dup(e);
  }
  async update(id: string, data: Partial<Evento>): Promise<Evento | null> {
    const i = this.items.findIndex((x) => x.id === id);
    if (i === -1) return null;
    this.items[i] = { ...this.items[i]!, ...data, id };
    return dup(this.items[i]!);
  }
  async remove(id: string): Promise<boolean> {
    const i = this.items.findIndex((x) => x.id === id);
    if (i === -1) return false;
    this.items.splice(i, 1);
    return true;
  }
}
