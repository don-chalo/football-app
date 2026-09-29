import { badRequest, conflict, notFound } from "../http/errors";
import type { MongooseEquiposRepo, MongooseJugadoresRepo } from "../repositories/catalogos.repository";
import { isDuplicateError } from "./users.service";
import type { Equipo, Jugador } from "../repositories/types";

function nombreValido(nombre: string): string {
  const n = nombre.trim();
  if (!n) throw badRequest("Nombre requerido");
  return n;
}

export function createEquiposService(equipos: MongooseEquiposRepo) {
  return {
    async create(nombre: string): Promise<Equipo> {
      const n = nombreValido(nombre);
      if (await equipos.findByNombre(n)) throw conflict("Nombre en uso");
      try {
        return await equipos.create(n);
      } catch (err) {
        if (isDuplicateError(err)) throw conflict("Nombre en uso");
        throw err;
      }
    },
    list(): Promise<Equipo[]> {
      return equipos.list();
    },
    async get(id: string): Promise<Equipo> {
      const e = await equipos.findById(id);
      if (!e) throw notFound("Equipo");
      return e;
    },
    async update(id: string, nombre: string): Promise<Equipo> {
      const n = nombreValido(nombre);
      const current = await equipos.findById(id);
      if (!current) throw notFound("Equipo");
      const otro = await equipos.findByNombre(n);
      if (otro && otro.id !== id) throw conflict("Nombre en uso");
      try {
        const updated = await equipos.update(id, n);
        if (!updated) throw notFound("Equipo");
        return updated;
      } catch (err) {
        if (isDuplicateError(err)) throw conflict("Nombre en uso");
        throw err;
      }
    },
    async remove(id: string): Promise<void> {
      if (!(await equipos.remove(id))) throw notFound("Equipo");
    },
  };
}

export interface BulkResult {
  creados: Jugador[];
  errores: Array<{ nombre: string; motivo: string }>;
}

export function createJugadoresService(jugadores: MongooseJugadoresRepo) {
  async function createOne(nombre: string): Promise<Jugador> {
    const n = nombreValido(nombre);
    if (await jugadores.findByNombre(n)) throw conflict("Nombre en uso");
    try {
      return await jugadores.create(n);
    } catch (err) {
      if (isDuplicateError(err)) throw conflict("Nombre en uso");
      throw err;
    }
  }

  return {
    create: createOne,
    async bulk(nombres: string[]): Promise<BulkResult> {
      const creados: Jugador[] = [];
      const errores: BulkResult["errores"] = [];
      const vistos = new Set<string>();
      for (const raw of nombres) {
        const n = raw.trim();
        if (!n) {
          errores.push({ nombre: raw, motivo: "Nombre requerido" });
          continue;
        }
        const key = n.toLocaleLowerCase("es");
        if (vistos.has(key)) {
          errores.push({ nombre: n, motivo: "Duplicado en el lote" });
          continue;
        }
        vistos.add(key);
        try {
          creados.push(await createOne(n));
        } catch {
          errores.push({ nombre: n, motivo: "Nombre en uso" });
        }
      }
      return { creados, errores };
    },
    list(): Promise<Jugador[]> {
      return jugadores.list();
    },
    async get(id: string): Promise<Jugador> {
      const j = await jugadores.findById(id);
      if (!j) throw notFound("Jugador");
      return j;
    },
    async update(id: string, nombre: string): Promise<Jugador> {
      const n = nombreValido(nombre);
      const current = await jugadores.findById(id);
      if (!current) throw notFound("Jugador");
      const otro = await jugadores.findByNombre(n);
      if (otro && otro.id !== id) throw conflict("Nombre en uso");
      try {
        const updated = await jugadores.update(id, n);
        if (!updated) throw notFound("Jugador");
        return updated;
      } catch (err) {
        if (isDuplicateError(err)) throw conflict("Nombre en uso");
        throw err;
      }
    },
    async remove(id: string): Promise<void> {
      if (!(await jugadores.remove(id))) throw notFound("Jugador");
    },
  };
}
