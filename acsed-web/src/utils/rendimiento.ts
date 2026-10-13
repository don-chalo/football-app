/** Rendimiento como texto con un decimal ("% de puntos posibles"). */
export function rendimiento(pg: number, pe: number, pj: number): string {
  if (pj <= 0) return "–";
  return (((3 * pg + pe) / (3 * pj)) * 100).toFixed(1);
}

/** Rendimiento numerico para ordenar; sin partidos va al fondo. */
export function rendimientoValor(pg: number, pe: number, pj: number): number {
  if (pj <= 0) return -1;
  return ((3 * pg + pe) / (3 * pj)) * 100;
}
