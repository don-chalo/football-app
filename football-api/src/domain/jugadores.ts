import { cuentaComoGoleador, golesFavorContra, resultadoEquipo } from "./marcador";
import type { ConvocatoriaBase, PartidoBase } from "./types";

export interface FilaJugador {
  jugadorId: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  goles: number;
  autogoles: number;
  convocados: number;
  ausentes: number;
  inasistencia: number;
  jugados: number;
}

/**
 * Stats por jugador. PJ/PG/PE/PP = resultado del equipo POR el que jugo
 * en cada partido donde estuvo presente (convocado no ausente).
 */
export function buildJugadores(
  partidos: PartidoBase[],
  convocatorias: ConvocatoriaBase[],
): FilaJugador[] {
  const partidosPorId = new Map(partidos.map((p) => [p.id, p]));
  const map = new Map<string, FilaJugador>();
  const fila = (jugadorId: string): FilaJugador => {
    let f = map.get(jugadorId);
    if (!f) {
      f = {
        jugadorId,
        pj: 0,
        pg: 0,
        pe: 0,
        pp: 0,
        goles: 0,
        autogoles: 0,
        convocados: 0,
        ausentes: 0,
        inasistencia: 0,
        jugados: 0,
      };
      map.set(jugadorId, f);
    }
    return f;
  };

  for (const c of convocatorias) {
    const f = fila(c.jugadorId);
    f.convocados += 1;
    if (c.estado === "ausente") {
      f.ausentes += 1;
      continue;
    }
    const p = partidosPorId.get(c.partidoId);
    if (!p) continue;
    f.pj += 1;
    f.jugados += 1;
    const { gf, gc } = golesFavorContra(p.eventos, c.equipoId, p.localId, p.visitaId);
    const r = resultadoEquipo(gf, gc);
    if (r === "PG") f.pg += 1;
    else if (r === "PE") f.pe += 1;
    else f.pp += 1;
    for (const e of p.eventos) {
      if (e.jugadorId !== c.jugadorId || e.equipoId !== c.equipoId) continue;
      if (cuentaComoGoleador(e.tipo)) f.goles += 1;
      else f.autogoles += 1;
    }
  }

  for (const f of map.values()) {
    f.inasistencia = f.convocados === 0 ? 0 : Math.round((f.ausentes / f.convocados) * 1000) / 10;
  }
  const filas = [...map.values()];
  filas.sort((a, b) => b.goles - a.goles || b.pj - a.pj || (a.jugadorId < b.jugadorId ? -1 : 1));
  return filas;
}
