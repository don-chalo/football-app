import { assertTransition } from "../domain/estado";
import { computeMarcador, type Marcador } from "../domain/marcador";
import { badRequest, notFound, unprocessable } from "../http/errors";
import type { MongooseLigasRepo } from "../repositories/catalogos.repository";
import type { MongooseConvocatoriasRepo, MongooseEventosRepo } from "../repositories/match.repository";
import type { MongoosePartidosRepo } from "../repositories/partidos.repository";
import type { MongooseEquiposRepo } from "../repositories/catalogos.repository";
import type { Actor, EstadoPartido, Evento, Partido } from "../repositories/types";

export interface Deps {
  partidos: MongoosePartidosRepo;
  ligas: Pick<MongooseLigasRepo, "findById">;
  equipos: Pick<MongooseEquiposRepo, "findById">;
  convocatorias: Pick<MongooseConvocatoriasRepo, "listByPartido">;
  eventos: Pick<MongooseEventosRepo, "listByPartido" | "listByPartidos">;
}

export interface PartidoInput {
  ligaId: string;
  localId: string;
  visitaId: string;
  fecha: string;
  fase?: string;
  idaDe?: string | null;
}

export type PartidoListado = Partido & { marcador: Marcador };

export function createPartidosService(d: Deps) {
  async function validarEquipos(localId: string, visitaId: string): Promise<void> {
    if (localId === visitaId) throw unprocessable("Local y visita deben ser distintos");
    const [l, v] = await Promise.all([d.equipos.findById(localId), d.equipos.findById(visitaId)]);
    if (!l || !v) throw notFound("Equipo");
  }

  return {
    async create(input: PartidoInput, actor?: Actor): Promise<Partido> {
      if (!(await d.ligas.findById(input.ligaId))) throw notFound("Liga");
      await validarEquipos(input.localId, input.visitaId);
      const fecha = new Date(input.fecha);
      if (Number.isNaN(fecha.getTime())) throw badRequest("Fecha invalida");
      const idaDe: string | null = input.idaDe ?? null;
      if (idaDe) {
        const ida = await d.partidos.findById(idaDe);
        if (!ida) throw notFound("Partido ida");
        if (ida.ligaId !== input.ligaId) throw unprocessable("La ida debe ser de la misma liga");
      }
      return d.partidos.create({
        ligaId: input.ligaId,
        localId: input.localId,
        visitaId: input.visitaId,
        fecha,
        fase: input.fase ?? "",
        idaDe,
        createdBy: actor ? { userId: actor.userId, username: actor.username } : null,
      });
    },

    async list(filtro?: { ligaId?: string; estado?: EstadoPartido }): Promise<PartidoListado[]> {
      const partidos = await d.partidos.list(filtro);
      const eventos = await d.eventos.listByPartidos(partidos.map((p) => p.id));
      const porPartido = new Map<string, Array<{ jugadorId: string; equipoId: string; tipo: Evento["tipo"] }>>();
      for (const e of eventos) {
        porPartido.set(e.partidoId, [...(porPartido.get(e.partidoId) ?? []), { jugadorId: e.jugadorId, equipoId: e.equipoId, tipo: e.tipo }]);
      }
      return partidos.map((p) => ({
        ...p,
        marcador: computeMarcador(porPartido.get(p.id) ?? [], p.localId, p.visitaId),
      }));
    },

    async detalle(id: string) {
      const p = await d.partidos.findById(id);
      if (!p) throw notFound("Partido");
      const [conv, evs] = await Promise.all([
        d.convocatorias.listByPartido(id),
        d.eventos.listByPartido(id),
      ]);
      const marcador = computeMarcador(
        evs.map((e) => ({ jugadorId: e.jugadorId, equipoId: e.equipoId, tipo: e.tipo })),
        p.localId,
        p.visitaId,
      );
      return { ...p, marcador, convocatorias: conv, eventos: evs };
    },

    async cambiarEstado(id: string, estado: EstadoPartido): Promise<Partido> {
      const p = await d.partidos.findById(id);
      if (!p) throw notFound("Partido");
      try {
        assertTransition(p.estado, estado);
      } catch {
        throw unprocessable(`Transicion no permitida: ${p.estado} -> ${estado}`);
      }
      const updated = await d.partidos.update(id, { estado });
      if (!updated) throw notFound("Partido");
      return updated;
    },

    async actualizar(
      id: string,
      patch: { fecha?: string; fase?: string; idaDe?: string | null; penalesLocal?: number | null; penalesVisita?: number | null; clasificadoId?: string | null },
      opts?: { full?: boolean },
    ): Promise<Partido> {
      const p = await d.partidos.findById(id);
      if (!p) throw notFound("Partido");
      if (opts?.full && patch.fecha === undefined) throw badRequest("Fecha requerida");
      const data: Parameters<Deps["partidos"]["update"]>[1] = {};
      if (patch.fecha !== undefined) {
        const fecha = new Date(patch.fecha);
        if (Number.isNaN(fecha.getTime())) throw badRequest("Fecha invalida");
        data.fecha = fecha;
      }
      if (patch.fase !== undefined) data.fase = patch.fase;
      if (patch.idaDe !== undefined) {
        if (patch.idaDe) {
          const ida = await d.partidos.findById(patch.idaDe);
          if (!ida) throw notFound("Partido ida");
          if (ida.ligaId !== p.ligaId) throw unprocessable("La ida debe ser de la misma liga");
          if (patch.idaDe === id) throw unprocessable("Un partido no puede ser ida de si mismo");
        }
        data.idaDe = patch.idaDe;
      }
      for (const k of ["penalesLocal", "penalesVisita"] as const) {
        if (patch[k] !== undefined) {
          const v = patch[k];
          if (v !== null && (!Number.isInteger(v) || v < 0)) throw unprocessable("Penales debe ser entero >= 0");
          data[k] = v;
        }
      }
      if (patch.clasificadoId !== undefined) {
        if (patch.clasificadoId && patch.clasificadoId !== p.localId && patch.clasificadoId !== p.visitaId) {
          throw unprocessable("El clasificado debe ser local o visita");
        }
        data.clasificadoId = patch.clasificadoId;
      }
      const updated = await d.partidos.update(id, data);
      if (!updated) throw notFound("Partido");
      return updated;
    },

    async remove(id: string): Promise<void> {
      if (!(await d.partidos.remove(id))) throw notFound("Partido");
    },
  };
}
