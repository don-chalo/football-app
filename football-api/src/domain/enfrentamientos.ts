import { computeMarcador } from "./marcador";
import type { PartidoBase } from "./types";

export interface Historial {
  equipoA: string;
  equipoB: string;
  pj: number;
  ganA: number;
  emp: number;
  ganB: number;
  gfA: number;
  gfB: number;
  partidos: Array<{ partidoId: string; golesA: number; golesB: number }>;
}

/** Historial entre dos equipos (A vs B en cualquier orden de localia). */
export function buildHistorial(partidos: PartidoBase[], equipoA: string, equipoB: string): Historial {
  const h: Historial = {
    equipoA,
    equipoB,
    pj: 0,
    ganA: 0,
    emp: 0,
    ganB: 0,
    gfA: 0,
    gfB: 0,
    partidos: [],
  };
  for (const p of partidos) {
    const esAB = p.localId === equipoA && p.visitaId === equipoB;
    const esBA = p.localId === equipoB && p.visitaId === equipoA;
    if (!esAB && !esBA) continue;
    const m = computeMarcador(p.eventos, p.localId, p.visitaId);
    const golesA = esAB ? m.local : m.visita;
    const golesB = esAB ? m.visita : m.local;
    h.pj += 1;
    h.gfA += golesA;
    h.gfB += golesB;
    if (golesA > golesB) h.ganA += 1;
    else if (golesA === golesB) h.emp += 1;
    else h.ganB += 1;
    h.partidos.push({ partidoId: p.id, golesA, golesB });
  }
  return h;
}
