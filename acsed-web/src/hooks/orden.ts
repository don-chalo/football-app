/** Más nuevos primero, solo por fecha (sin desempate). No muta el array. */
export function porFechaDesc<T extends { fecha: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0));
}
