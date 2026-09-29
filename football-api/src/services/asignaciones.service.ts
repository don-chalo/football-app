import { conflict, notFound, unprocessable } from "../http/errors";
import type { MongooseAsignacionesRepo } from "../repositories/asignaciones.repository";
import type { MongooseLigasRepo } from "../repositories/catalogos.repository";
import type { MongooseUsersRepo } from "../repositories/users.repository";
import type { Asignacion } from "../repositories/types";
import { isDuplicateError } from "./users.service";

export interface Deps {
  asignaciones: MongooseAsignacionesRepo;
  users: Pick<MongooseUsersRepo, "findById">;
  ligas: Pick<MongooseLigasRepo, "findById">;
}

export function createAsignacionesService(d: Deps) {
  return {
    listByLiga(ligaId: string): Promise<Asignacion[]> {
      return d.asignaciones.listByLiga(ligaId);
    },

    async asignar(userId: string, ligaId: string): Promise<Asignacion> {
      const [u, l] = await Promise.all([d.users.findById(userId), d.ligas.findById(ligaId)]);
      if (!u) throw notFound("Usuario");
      if (!l) throw notFound("Liga");
      if (u.role !== "admin_partidos") throw unprocessable("Solo admin_partidos puede asignarse a ligas");
      if (await d.asignaciones.exists(userId, ligaId)) throw conflict("Asignación existente");
      try {
        return await d.asignaciones.create(userId, ligaId);
      } catch (err) {
        if (isDuplicateError(err)) throw conflict("Asignación existente");
        throw err;
      }
    },

    async quitar(userId: string, ligaId: string): Promise<void> {
      const actual = await d.asignaciones.countByLiga(ligaId);
      const existe = await d.asignaciones.exists(userId, ligaId);
      if (!existe) throw notFound("Asignación");
      if (actual <= 1) throw unprocessable("La liga debe tener al menos un admin");
      await d.asignaciones.remove(userId, ligaId);
    },
  };
}
