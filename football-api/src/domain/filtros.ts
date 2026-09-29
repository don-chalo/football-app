export interface Rango {
  desde: Date;
  hasta: Date;
}

const MAX_MS = 366 * 24 * 60 * 60 * 1000; // un ano (bisiesto incluido)

/**
 * Resuelve rango de fechas: default ano en curso, maximo 1 ano.
 * Lanza Error con mensaje apto para 422 si es invalido.
 */
export function resolveRango(desdeRaw?: string, hastaRaw?: string, now: Date = new Date()): Rango {
  const year = now.getFullYear();
  const desde = desdeRaw ? new Date(desdeRaw) : new Date(year, 0, 1);
  const hasta = hastaRaw ? new Date(hastaRaw) : new Date(year, 11, 31, 23, 59, 59, 999);
  if (Number.isNaN(desde.getTime()) || Number.isNaN(hasta.getTime())) {
    throw new Error("Rango de fechas invalido");
  }
  if (desde > hasta) throw new Error("Desde no puede ser posterior a hasta");
  if (hasta.getTime() - desde.getTime() > MAX_MS) throw new Error("El rango maximo es un ano");
  return { desde, hasta };
}
