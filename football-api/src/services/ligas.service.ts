import { badRequest, notFound } from "../http/errors";
import type { MongooseAsignacionesRepo } from "../repositories/asignaciones.repository";
import type { MongooseLigasRepo } from "../repositories/catalogos.repository";
import type { Actor, Liga, Role } from "../repositories/types";

function esFormatoValido(f: string): f is "liga" | "copa" {
  return f === "liga" || f === "copa";
}

export interface Deps {
  ligas: MongooseLigasRepo;
  asignaciones?: Pick<MongooseAsignacionesRepo, "create" | "removeByLiga">;
}

export function createLigasService(deps: Deps) {
  const { ligas, asignaciones } = deps;

  function normalize(input: { nombre: string; formato: "liga" | "copa"; idaVuelta?: boolean }): {
    nombre: string;
    formato: "liga" | "copa";
    idaVuelta: boolean;
  } {
    if (!input.nombre.trim()) throw badRequest("Nombre requerido");
    if (!esFormatoValido(input.formato)) throw badRequest("Formato debe ser liga|copa");
    const f: "liga" | "copa" = input.formato;
    return { nombre: input.nombre.trim(), formato: f, idaVuelta: f === "copa" && (input.idaVuelta ?? false) };
  }

  return {
    async create(
      input: { nombre: string; formato: "liga" | "copa"; idaVuelta?: boolean },
      actor?: Actor & { role: Role },
    ): Promise<Liga> {
      const created = await ligas.create({
        ...normalize(input),
        createdBy: actor ? { userId: actor.userId, username: actor.username } : null,
      });
      if (actor && actor.role === "admin_partidos" && asignaciones) {
        await asignaciones.create(actor.userId, created.id);
      }
      return created;
    },
    async list(): Promise<Liga[]> {
      return ligas.list();
    },
    async get(id: string): Promise<Liga> {
      const l = await ligas.findById(id);
      if (!l) throw notFound("Liga");
      return l;
    },
    async update(id: string, input: { nombre?: string; formato?: "liga" | "copa"; idaVuelta?: boolean }): Promise<Liga> {
      const current = await ligas.findById(id);
      if (!current) throw notFound("Liga");
      const merged = normalize({
        nombre: input.nombre ?? current.nombre,
        formato: input.formato ?? current.formato,
        idaVuelta: input.idaVuelta ?? current.idaVuelta,
      });
      const updated = await ligas.update(id, merged);
      if (!updated) throw notFound("Liga");
      return updated;
    },
    async remove(id: string): Promise<void> {
      if (!(await ligas.remove(id))) throw notFound("Liga");
      if (asignaciones) await asignaciones.removeByLiga(id);
    },
  };
}
