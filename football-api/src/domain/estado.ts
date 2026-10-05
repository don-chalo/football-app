import type { EstadoPartido } from "./types";

const ALLOWED: Record<EstadoPartido, EstadoPartido[]> = {
  programado: ["en_juego", "suspendido"],
  en_juego: ["finalizado"],
  finalizado: [],
  suspendido: [],
};

/** Maquina de estados pura: programado -> en_juego -> finalizado, programado -> suspendido (terminal), nunca volver a programado. */
export function canTransition(from: EstadoPartido, to: EstadoPartido): boolean {
  return ALLOWED[from].includes(to);
}

export function assertTransition(from: EstadoPartido, to: EstadoPartido): void {
  if (!canTransition(from, to)) {
    throw new Error(`Transicion no permitida: ${from} -> ${to}`);
  }
}
