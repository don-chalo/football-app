import type { ResultadoEquipo } from "./marcador";

export type LetraResultado = "G" | "E" | "P";

export const TAM_RACHA = 5;

/** Traduce el resultado de un equipo (PG/PE/PP) a la letra mostrada en la racha. */
export function letraResultado(r: ResultadoEquipo): LetraResultado {
  if (r === "PG") return "G";
  if (r === "PE") return "E";
  return "P";
}

/** Ultimos N elementos ordenados por fecha descendente (mas reciente primero). */
export function ultimos<T extends { fecha: Date }>(items: T[], n = TAM_RACHA): T[] {
  return [...items].sort((a, b) => b.fecha.getTime() - a.fecha.getTime()).slice(0, n);
}

/** Redondea a 1 decimal. null si no hay partidos (evita division por cero). */
export function promedio(total: number, pj: number): number | null {
  if (pj <= 0) return null;
  return Math.round((total / pj) * 10) / 10;
}
