import { cuentaComoGoleador, golesFavorContra, resultadoEquipo } from "./marcador";
import { letraResultado, promedio, ultimos, type LetraResultado } from "./racha";
import type { ConvocatoriaBase, PartidoBase } from "./types";

export interface FilaJugador {
  jugadorId: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  goles: number;
  autogoles: number;
  amarillas: number;
  rojas: number;
  convocados: number;
  ausentes: number;
  inasistencia: number;
  jugados: number;
  promedioGoles: number | null;
  pctGf: number | null;
  pctGc: number | null;
  mvp: number;
  rachaGoles: number;
  racha: LetraResultado[];
}

interface ParticipacionJugador {
  partidoId: string;
  fecha: Date;
  resultado: ReturnType<typeof resultadoEquipo>;
  gf: number;
  gc: number;
  golesJugador: number;
}

/**
 * Stats por jugador. PJ/PG/PE/PP = resultado del equipo POR el que jugo
 * en cada partido donde estuvo presente (convocado no ausente).
 * Racha = ultimos 5 partidos presentes, de cualquier equipo.
 */
export function buildJugadores(
  partidos: PartidoBase[],
  convocatorias: ConvocatoriaBase[],
): FilaJugador[] {
  const partidosPorId = new Map(partidos.map((p) => [p.id, p]));
  const map = new Map<string, FilaJugador>();
  const participaciones = new Map<string, ParticipacionJugador[]>();
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
        amarillas: 0,
        rojas: 0,
        convocados: 0,
        ausentes: 0,
        inasistencia: 0,
        jugados: 0,
        promedioGoles: null,
        pctGf: null,
        pctGc: null,
        mvp: 0,
        rachaGoles: 0,
        racha: [],
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
    let golesJugador = 0;
    for (const e of p.eventos) {
      if (e.jugadorId !== c.jugadorId || e.equipoId !== c.equipoId) continue;
      if (cuentaComoGoleador(e.tipo)) {
        f.goles += 1;
        golesJugador += 1;
      } else if (e.tipo === "autogol") f.autogoles += 1;
      else if (e.tipo === "amarilla") f.amarillas += 1;
      else if (e.tipo === "roja") f.rojas += 1;
    }
    const lista = participaciones.get(c.jugadorId) ?? [];
    lista.push({ partidoId: p.id, fecha: p.fecha, resultado: r, gf, gc, golesJugador });
    participaciones.set(c.jugadorId, lista);
    if (p.mvpJugadorId === c.jugadorId) f.mvp += 1;
  }

  for (const f of map.values()) {
    f.inasistencia = f.convocados === 0 ? 0 : Math.round((f.ausentes / f.convocados) * 1000) / 10;
    const parts = participaciones.get(f.jugadorId) ?? [];
    const sumGf = parts.reduce((acc, x) => acc + x.gf, 0);
    const sumGc = parts.reduce((acc, x) => acc + x.gc, 0);
    f.promedioGoles = promedio(f.goles, f.pj);
    f.pctGf = promedio(sumGf, f.pj);
    f.pctGc = promedio(sumGc, f.pj);
    f.racha = ultimos(parts).map((x) => letraResultado(x.resultado));
    f.rachaGoles = rachaConsecutiva(parts);
  }
  const filas = [...map.values()];
  filas.sort((a, b) => b.goles - a.goles || b.pj - a.pj || (a.jugadorId < b.jugadorId ? -1 : 1));
  return filas;
}

/** Partidos consecutivos con al menos 1 gol, desde el mas reciente. Cualquier partido sin gol corta la racha. */
function rachaConsecutiva(parts: ParticipacionJugador[]): number {
  let n = 0;
  for (const x of ultimos(parts, parts.length)) {
    if (x.golesJugador < 1) break;
    n += 1;
  }
  return n;
}
