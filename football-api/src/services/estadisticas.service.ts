import { buildHistorial } from "../domain/enfrentamientos";
import { resolveRango } from "../domain/filtros";
import { buildJugadores } from "../domain/jugadores";
import { buildTabla } from "../domain/tabla";
import { unprocessable } from "../http/errors";
import type { MongooseEquiposRepo, MongooseJugadoresRepo } from "../repositories/catalogos.repository";
import type { MongooseConvocatoriasRepo, MongooseEventosRepo } from "../repositories/match.repository";
import type { MongoosePartidosRepo } from "../repositories/partidos.repository";
import type { PartidoBase } from "../domain/types";

export interface Deps {
  partidos: Pick<MongoosePartidosRepo, "list">;
  convocatorias: Pick<MongooseConvocatoriasRepo, "listByPartidos">;
  eventos: Pick<MongooseEventosRepo, "listByPartidos">;
  equipos: Pick<MongooseEquiposRepo, "list">;
  jugadores: Pick<MongooseJugadoresRepo, "list">;
}

export interface FiltrosBase {
  ligaIds?: string[];
  desde?: string;
  hasta?: string;
}

function parseLigaIds(raw: unknown): string[] | undefined {
  if (raw === undefined) return undefined;
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.flatMap((v) => String(v).split(",").map((s) => s.trim()).filter(Boolean));
}

async function baseFiltrada(d: Deps, f: FiltrosBase, partidoId?: string): Promise<PartidoBase[]> {
  let rango;
  try {
    rango = resolveRango(f.desde, f.hasta);
  } catch (err) {
    throw unprocessable(err instanceof Error ? err.message : "Rango invalido");
  }
  const ligaIds = parseLigaIds(f.ligaIds);
  const todos = await d.partidos.list({ estado: "finalizado" });
  return todos
    .filter((p) => !ligaIds || ligaIds.includes(p.ligaId))
    .filter((p) => p.fecha >= rango.desde && p.fecha <= rango.hasta)
    .filter((p) => !partidoId || p.id === partidoId)
    .map((p) => ({ id: p.id, ligaId: p.ligaId, localId: p.localId, visitaId: p.visitaId, fecha: p.fecha, estado: p.estado, eventos: [] }));
}

export function createEstadisticasService(d: Deps) {
  return {
    async equipos(f: FiltrosBase) {
      const base = await baseFiltrada(d, f);
      const ids = base.map((p) => p.id);
      const evs = await d.eventos.listByPartidos(ids);
      const porPartido = new Map<string, PartidoBase["eventos"]>();
      for (const e of evs) {
        const l = porPartido.get(e.partidoId) ?? [];
        l.push({ jugadorId: e.jugadorId, equipoId: e.equipoId, tipo: e.tipo });
        porPartido.set(e.partidoId, l);
      }
      const partidos: PartidoBase[] = base.map((p) => ({ ...p, eventos: porPartido.get(p.id) ?? [] }));
      const tabla = buildTabla(partidos);
      const nombres = new Map((await d.equipos.list()).map((e) => [e.id, e.nombre]));
      return tabla.map((t) => ({ ...t, nombre: nombres.get(t.equipoId) ?? t.equipoId }));
    },

    async jugadores(f: FiltrosBase & { equipoId?: string; partidoId?: string }) {
      const base = await baseFiltrada(d, f, f.partidoId);
      const ids = base.map((p) => p.id);
      const [evs, convs] = await Promise.all([
        d.eventos.listByPartidos(ids),
        d.convocatorias.listByPartidos(ids),
      ]);
      const porPartido = new Map<string, PartidoBase["eventos"]>();
      for (const e of evs) {
        const l = porPartido.get(e.partidoId) ?? [];
        l.push({ jugadorId: e.jugadorId, equipoId: e.equipoId, tipo: e.tipo });
        porPartido.set(e.partidoId, l);
      }
      const partidos: PartidoBase[] = base.map((p) => ({ ...p, eventos: porPartido.get(p.id) ?? [] }));
      const convFiltradas = f.equipoId ? convs.filter((c) => c.equipoId === f.equipoId) : convs;
      const filas = buildJugadores(partidos, convFiltradas);
      const nombres = new Map((await d.jugadores.list()).map((j) => [j.id, j.nombre]));
      return filas.map((r) => ({ ...r, nombre: nombres.get(r.jugadorId) ?? r.jugadorId }));
    },

    async enfrentamientos(f: FiltrosBase & { equipoA: string; equipoB: string }) {
      const base = await baseFiltrada(d, f);
      const ids = base.map((p) => p.id);
      const evs = await d.eventos.listByPartidos(ids);
      const porPartido = new Map<string, PartidoBase["eventos"]>();
      for (const e of evs) {
        const l = porPartido.get(e.partidoId) ?? [];
        l.push({ jugadorId: e.jugadorId, equipoId: e.equipoId, tipo: e.tipo });
        porPartido.set(e.partidoId, l);
      }
      const partidos: PartidoBase[] = base.map((p) => ({ ...p, eventos: porPartido.get(p.id) ?? [] }));
      return buildHistorial(partidos, f.equipoA, f.equipoB);
    },
  };
}
