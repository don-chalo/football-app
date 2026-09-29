import { golesFavorContra, resultadoEquipo } from "./marcador";
import type { PartidoBase } from "./types";

export interface FilaEquipo {
  equipoId: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dif: number;
  pts: number;
}

/** Agrega tabla de equipos (solo partidos finalizados ya filtrados). Pts siempre: 3/1/0. */
export function buildTabla(partidos: PartidoBase[]): FilaEquipo[] {
  const map = new Map<string, FilaEquipo>();
  const fila = (equipoId: string): FilaEquipo => {
    let f = map.get(equipoId);
    if (!f) {
      f = { equipoId, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dif: 0, pts: 0 };
      map.set(equipoId, f);
    }
    return f;
  };

  for (const p of partidos) {
    const l = golesFavorContra(p.eventos, p.localId, p.localId, p.visitaId);
    const v = golesFavorContra(p.eventos, p.visitaId, p.localId, p.visitaId);
    const rl = resultadoEquipo(l.gf, l.gc);
    const fl = fila(p.localId);
    const fv = fila(p.visitaId);
    fl.pj += 1;
    fv.pj += 1;
    fl.gf += l.gf;
    fl.gc += l.gc;
    fv.gf += v.gf;
    fv.gc += v.gc;
    if (rl === "PG") {
      fl.pg += 1;
      fv.pp += 1;
    } else if (rl === "PE") {
      fl.pe += 1;
      fv.pe += 1;
    } else {
      fl.pp += 1;
      fv.pg += 1;
    }
  }

  const filas = [...map.values()].map((f) => ({
    ...f,
    dif: f.gf - f.gc,
    pts: f.pg * 3 + f.pe,
  }));
  filas.sort((a, b) => b.pts - a.pts || b.dif - a.dif || b.gf - a.gf || (a.equipoId < b.equipoId ? -1 : 1));
  return filas;
}
