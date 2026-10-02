function dos(n: number): string {
  return String(n).padStart(2, "0");
}

/** "02/10/2026 16:05" en hora local, sin segundos. */
export function formatoFechaCorta(iso: string): string {
  const f = new Date(iso);
  return `${dos(f.getDate())}/${dos(f.getMonth() + 1)}/${String(f.getFullYear())} ${dos(f.getHours())}:${dos(f.getMinutes())}`;
}

/** "16:05" en hora local. */
export function formatoHora(iso: string): string {
  const f = new Date(iso);
  return `${dos(f.getHours())}:${dos(f.getMinutes())}`;
}
