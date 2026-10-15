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

/** Cuerpo estilo finalizado: goles + penales. Desde la línea 3, en juego usa la misma lógica. */
function cuerpoFinalizado(detalle: PartidoDetalle, jugadores: Map<string, string>): string[] {
  const lineas = [...bloqueGoles(detalle.eventos, jugadores)];
  if (detalle.penalesLocal !== null && detalle.penalesVisita !== null) {
    lineas.push("", `Penales: ${detalle.penalesLocal.toString()} - ${detalle.penalesVisita.toString()}`);
  }
  return lineas;
}

/** Texto del resultado de un partido finalizado para compartir por WhatsApp. */
export function textoResultado(detalle: PartidoDetalle, nombres: NombresCompartir, origin: string): string {
  const local = (nombres.equipos.get(detalle.localId) ?? "?").toUpperCase();
  const visita = (nombres.equipos.get(detalle.visitaId) ?? "?").toUpperCase();
  const lineas = [
    `${local} ${detalle.marcador.local.toString()} - ${detalle.marcador.visita.toString()} ${visita}`,
    `${nombres.liga} · ${formatoFechaCorta(detalle.fecha)}`,
    "",
    ...cuerpoFinalizado(detalle, nombres.jugadores),
  ];
  lineas.push("", `${origin}/partidos/${detalle.id}`);
  return lineas.join("\n");
}

/** Texto a compartir según estado. Minuto actual solo para en juego (foto al renderizar). Null en suspendido. */
export function textoCompartir(detalle: PartidoDetalle, nombres: NombresCompartir, origin: string, minutoActual: number | null): string | null {
  const local = (nombres.equipos.get(detalle.localId) ?? "?").toUpperCase();
  const visita = (nombres.equipos.get(detalle.visitaId) ?? "?").toUpperCase();
  const ligaFecha = `${nombres.liga} · ${formatoFechaCorta(detalle.fecha)}`;
  const enlace = `${origin}/partidos/${detalle.id}`;
  if (detalle.estado === "programado") {
    return [`${local} vs ${visita}`, ligaFecha, "", enlace].join("\n");
  }
  if (detalle.estado === "en_juego") {
    const encabezado = minutoActual !== null
      ? `EN VIVO ${minutoActual.toString()}' — ${local} ${detalle.marcador.local.toString()} - ${detalle.marcador.visita.toString()} ${visita}`
      : `EN VIVO — ${local} ${detalle.marcador.local.toString()} - ${detalle.marcador.visita.toString()} ${visita}`;
    return [encabezado, ligaFecha, "", ...cuerpoFinalizado(detalle, nombres.jugadores), "", enlace].join("\n");
  }
  if (detalle.estado === "finalizado") {
    return textoResultado(detalle, nombres, origin);
  }
  return null;
}

/** Enlace wa.me (sin número: el usuario elige el chat) para el texto dado. */
export function enlaceWhatsApp(texto: string): string {
  return `https://wa.me/?text=${encodeURIComponent(texto)}`;
}
