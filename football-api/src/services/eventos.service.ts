import { TIPOS_EVENTO } from "../domain/types";
import { badRequest, notFound, unprocessable } from "../http/errors";
import type { MongooseConvocatoriasRepo, MongooseEventosRepo } from "../repositories/match.repository";
import type { MongoosePartidosRepo } from "../repositories/partidos.repository";
import type { Actor, Evento, TipoEvento } from "../repositories/types";

export interface Deps {
  eventos: MongooseEventosRepo;
  convocatorias: Pick<MongooseConvocatoriasRepo, "findByPartidoJugador" | "listByPartido">;
  partidos: Pick<MongoosePartidosRepo, "findById">;
}

export interface EventoInput {
  jugadorId: string;
  equipoId: string;
  tipo: TipoEvento;
  minuto?: number | null;
  metadata?: unknown;
}

async function validarRegistro(
  d: Deps,
  partidoId: string,
  jugadorId: string,
  equipoId: string,
): Promise<void> {
  const p = await d.partidos.findById(partidoId);
  if (!p) throw notFound("Partido");
  if (p.estado === "programado") throw unprocessable("El partido aun no esta en juego");
  if (equipoId !== p.localId && equipoId !== p.visitaId) {
    throw unprocessable("El equipo debe ser local o visita del partido");
  }
  const conv = await d.convocatorias.findByPartidoJugador(partidoId, jugadorId);
  if (!conv || conv.estado !== "convocado" || conv.equipoId !== equipoId) {
    throw unprocessable("Solo jugadores convocados (presentes) pueden registrar eventos");
  }
}

export function createEventosService(d: Deps) {
  return {
    list(partidoId: string): Promise<Evento[]> {
      return d.eventos.listByPartido(partidoId);
    },

    async registrar(partidoId: string, input: EventoInput, actor?: Actor): Promise<Evento> {
      if (!TIPOS_EVENTO.includes(input.tipo)) throw badRequest("Tipo debe ser gol|autogol|penal");
      if (input.minuto !== undefined && input.minuto !== null && (!Number.isInteger(input.minuto) || input.minuto < 0)) {
        throw unprocessable("Minuto debe ser entero >= 0");
      }
      await validarRegistro(d, partidoId, input.jugadorId, input.equipoId);
      return d.eventos.create({
        partidoId,
        jugadorId: input.jugadorId,
        equipoId: input.equipoId,
        tipo: input.tipo,
        minuto: input.minuto ?? null,
        metadata: input.metadata,
        createdBy: actor ? { userId: actor.userId, username: actor.username } : null,
      });
    },

    async actualizar(
      id: string,
      patch: Partial<Pick<Evento, "tipo" | "minuto" | "metadata" | "jugadorId" | "equipoId">>,
    ): Promise<Evento> {
      const current = await d.eventos.findById(id);
      if (!current) throw notFound("Evento");
      if (patch.tipo !== undefined && !TIPOS_EVENTO.includes(patch.tipo)) {
        throw badRequest("Tipo debe ser gol|autogol|penal");
      }
      const jugadorId = patch.jugadorId ?? current.jugadorId;
      const equipoId = patch.equipoId ?? current.equipoId;
      if (jugadorId !== current.jugadorId || equipoId !== current.equipoId) {
        await validarRegistro(d, current.partidoId, jugadorId, equipoId);
      }
      const updated = await d.eventos.update(id, { ...patch, jugadorId, equipoId });
      if (!updated) throw notFound("Evento");
      return updated;
    },

    async remove(id: string): Promise<void> {
      if (!(await d.eventos.remove(id))) throw notFound("Evento");
    },
  };
}
