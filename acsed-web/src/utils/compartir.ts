import type { Evento, PartidoDetalle } from "../api/types";
import { formatoFechaCorta } from "./fecha";

export interface NombresCompartir {
  equipos: Map<string, string>;
  jugadores: Map<string, string>;
  liga: string;
}

const SUFIJO: Record<Evento["tipo"], string> = { gol: "", penal: "(p)", autogol: "(ag)", amarilla: "(am)", roja: "(rj)" };

/** Bloque de goles del mensaje a compartir. Sin minutos en ningún evento: conteo por jugador. */
function bloqueGoles(eventos: Evento[], jugadores: Map<string, string>): string[] {
  const goles = eventos.filter((e) => e.tipo === "gol" || e.tipo === "penal" || e.tipo === "autogol");
  if (goles.length === 0) return ["Sin goles."];
  if (goles.every((e) => e.minuto === null)) {
    const conteo = new Map<string, number>();
    for (const e of goles) conteo.set(e.jugadorId, (conteo.get(e.jugadorId) ?? 0) + 1);
    const ordenados = [...conteo.entries()].sort(([aId, aN], [bId, bN]) =>
      bN - aN || (jugadores.get(aId) ?? "?").localeCompare(jugadores.get(bId) ?? "?"),
    );
    const lineas = ordenados.map(
      ([jugadorId, n]) => `- ${jugadores.get(jugadorId) ?? "?"} ${n.toString()} ${n === 1 ? "gol" : "goles"}`,
    );
    return ["Goleadores:", ...lineas];
  }
  const porJugador = new Map<string, string[]>();
  for (const e of goles) {
    const minutos = porJugador.get(e.jugadorId) ?? [];
    if (e.minuto !== null) minutos.push(`${e.minuto.toString()}'${SUFIJO[e.tipo]}`);
    porJugador.set(e.jugadorId, minutos);
  }
  const lineas = [...porJugador.entries()].map(([jugadorId, minutos]) => {
    const nombre = jugadores.get(jugadorId) ?? "?";
    if (minutos.length === 0) return `- ${nombre}`;
    return `- ${nombre} ${minutos.join(", ")}`;
  });
  return ["Goles:", ...lineas];
}

/** Texto del resultado de un partido finalizado para compartir por WhatsApp. */
export function textoResultado(detalle: PartidoDetalle, nombres: NombresCompartir, origin: string): string {
  const local = (nombres.equipos.get(detalle.localId) ?? "?").toUpperCase();
  const visita = (nombres.equipos.get(detalle.visitaId) ?? "?").toUpperCase();
  const lineas = [
    `${local} ${detalle.marcador.local.toString()} - ${detalle.marcador.visita.toString()} ${visita}`,
    `${nombres.liga} · ${formatoFechaCorta(detalle.fecha)}`,
    "",
    ...bloqueGoles(detalle.eventos, nombres.jugadores),
  ];
  if (detalle.penalesLocal !== null && detalle.penalesVisita !== null) {
    lineas.push("", `Penales: ${detalle.penalesLocal.toString()} - ${detalle.penalesVisita.toString()}`);
  }
  lineas.push("", `${origin}/partidos/${detalle.id}`);
  return lineas.join("\n");
}

/** Enlace wa.me (sin número: el usuario elige el chat) para el texto dado. */
export function enlaceWhatsApp(texto: string): string {
  return `https://wa.me/?text=${encodeURIComponent(texto)}`;
}
