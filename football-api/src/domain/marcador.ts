import type { EventoBase, TipoEvento } from "./types";

/**
 * Strategy de contabilizacion por tipo de evento.
 * Devuelve a que equipo se le suma el gol en el marcador.
 * - gol | penal (en juego): suma al equipo del jugador.
 * - autogol: suma al RIVAL del equipo del jugador.
 * La tanda de penales NO pasa por aqui (campos penales_* del partido, excluidos).
 */
export function equipoQueSuma(evento: EventoBase, localId: string, visitaId: string): string {
  switch (evento.tipo) {
    case "gol":
    case "penal":
      return evento.equipoId;
    case "autogol":
      if (evento.equipoId === localId) return visitaId;
      return localId;
    default: {
      const _exhaustive: never = evento.tipo;
      throw new Error(`Tipo de evento desconocido: ${String(_exhaustive)}`);
    }
  }
}

export interface Marcador {
  local: number;
  visita: number;
}

/** Marcador calculado sumando eventos (nunca se carga a mano). */
export function computeMarcador(eventos: EventoBase[], localId: string, visitaId: string): Marcador {
  let local = 0;
  let visita = 0;
  for (const e of eventos) {
    const suma = equipoQueSuma(e, localId, visitaId);
    if (suma === localId) local += 1;
    else if (suma === visitaId) visita += 1;
    // Evento de un equipo ajeno al partido: se ignora (validado en el borde).
  }
  return { local, visita };
}

/** GF y GC de un equipo en un partido a partir de sus eventos. */
export function golesFavorContra(
  eventos: EventoBase[],
  equipoId: string,
  localId: string,
  visitaId: string,
): { gf: number; gc: number } {
  const rival = equipoId === localId ? visitaId : localId;
  let gf = 0;
  let gc = 0;
  for (const e of eventos) {
    if (e.tipo === "gol" || e.tipo === "penal") {
      if (e.equipoId === equipoId) gf += 1;
      else if (e.equipoId === rival) gc += 1;
    } else {
      // autogol: suma GF al rival del equipo del jugador, GC al propio
      if (e.equipoId === equipoId) gc += 1;
      else if (e.equipoId === rival) gf += 1;
    }
  }
  return { gf, gc };
}

export type ResultadoEquipo = "PG" | "PE" | "PP";

export function resultadoEquipo(gf: number, gc: number): ResultadoEquipo {
  if (gf > gc) return "PG";
  if (gf === gc) return "PE";
  return "PP";
}

/** Indica si un tipo de evento cuenta para la tabla de goleadores. */
export function cuentaComoGoleador(tipo: TipoEvento): boolean {
  return tipo === "gol" || tipo === "penal";
}
