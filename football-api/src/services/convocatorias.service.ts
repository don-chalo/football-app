import { notFound, unprocessable } from "../http/errors";
import type { MongooseConvocatoriasRepo } from "../repositories/match.repository";
import type { MongoosePartidosRepo } from "../repositories/partidos.repository";
import type { MongooseEquiposRepo, MongooseJugadoresRepo } from "../repositories/catalogos.repository";
import type { Actor, Convocatoria } from "../repositories/types";

export interface Deps {
  convocatorias: MongooseConvocatoriasRepo;
  partidos: Pick<MongoosePartidosRepo, "findById">;
  jugadores: Pick<MongooseJugadoresRepo, "findById">;
  equipos: Pick<MongooseEquiposRepo, "findById">;
}

export function createConvocatoriasService(d: Deps) {
  return {
    list(partidoId: string): Promise<Convocatoria[]> {
      return d.convocatorias.listByPartido(partidoId);
    },

    async convocar(partidoId: string, jugadorId: string, equipoId: string, actor?: Actor): Promise<Convocatoria> {
      const p = await d.partidos.findById(partidoId);
      if (!p) throw notFound("Partido");
      const [jug, eq] = await Promise.all([d.jugadores.findById(jugadorId), d.equipos.findById(equipoId)]);
      if (!jug) throw notFound("Jugador");
      if (!eq) throw notFound("Equipo");
      if (equipoId !== p.localId && equipoId !== p.visitaId) {
        throw unprocessable("El equipo debe ser local o visita del partido");
      }
      if (await d.convocatorias.findByPartidoJugador(partidoId, jugadorId)) {
        throw unprocessable("El jugador ya esta convocado en este partido (un jugador, un equipo)");
      }
      return d.convocatorias.create({
        partidoId,
        jugadorId,
        equipoId,
        estado: "convocado",
        createdBy: actor ? { userId: actor.userId, username: actor.username } : null,
      });
    },

    async convocarLote(partidoId: string, equipoId: string, jugadorIds: string[], actor?: Actor): Promise<{ creados: Convocatoria[]; omitidos: string[] }> {
      const p = await d.partidos.findById(partidoId);
      if (!p) throw notFound("Partido");
      const eq = await d.equipos.findById(equipoId);
      if (!eq) throw notFound("Equipo");
      if (equipoId !== p.localId && equipoId !== p.visitaId) {
        throw unprocessable("El equipo debe ser local o visita del partido");
      }
      const creados: Convocatoria[] = [];
      const omitidos: string[] = [];
      const vistos = new Set<string>();
      for (const jugadorId of jugadorIds) {
        if (vistos.has(jugadorId)) {
          omitidos.push(jugadorId);
          continue;
        }
        vistos.add(jugadorId);
        const jug = await d.jugadores.findById(jugadorId);
        if (!jug) throw notFound("Jugador");
        if (await d.convocatorias.findByPartidoJugador(partidoId, jugadorId)) {
          omitidos.push(jugadorId);
          continue;
        }
        creados.push(await d.convocatorias.create({
          partidoId,
          jugadorId,
          equipoId,
          estado: "convocado",
          createdBy: actor ? { userId: actor.userId, username: actor.username } : null,
        }));
      }
      return { creados, omitidos };
    },

    async marcar(id: string, estado: Convocatoria["estado"]): Promise<Convocatoria> {
      const c = await d.convocatorias.findById(id);
      if (!c) throw notFound("Convocatoria");
      const updated = await d.convocatorias.update(id, estado);
      if (!updated) throw notFound("Convocatoria");
      return updated;
    },

    async remove(id: string): Promise<void> {
      if (!(await d.convocatorias.remove(id))) throw notFound("Convocatoria");
    },
  };
}
