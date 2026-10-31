import type { Evento, PartidoDetalle } from "../api/types";
import { formatoFechaCorta } from "./fecha";

export interface NombresCompartir {
  equipos: Map<string, string>;
  jugadores: Map<string, string>;
  liga: string;
}

const SUFIJO: Record<Evento["tipo"], string> = { gol: "", penal: "(p)", autogol: "(ag)", amarilla: "(am)", roja: "(rj)" };

function bloqueGolesGeneral(eventos: Evento[], jugadores: Map<string, string>): string[] {
  const goles = eventos.filter((e) => e.tipo === "gol" || e.tipo === "penal" || e.tipo === "autogol");
  if (goles.length === 0) return ["Sin goles."];
  // Obtener goles por jugador.
  const golesPorJugador = new Map<string, string[]>();
  for (const e of goles) {
    const minutos = golesPorJugador.get(e.jugadorId) ?? [];
    minutos.push(e.minuto && `${e.minuto.toString()}'${SUFIJO[e.tipo]}` || "?");
    golesPorJugador.set(e.jugadorId, minutos);
  }
  // Ordenar por cantidad de goles y luego por nombre.
  const jugadoresOrdenados = [...golesPorJugador.entries()].sort(([aId, aMinutos], [bId, bMinutos]) =>
    bMinutos.length - aMinutos.length || (jugadores.get(aId) ?? "?").localeCompare(jugadores.get(bId) ?? "?"),
  );
  // Generar líneas de texto.
  const lineas = jugadoresOrdenados.map(([jugadorId, minutos]) => {
    const nombre = jugadores.get(jugadorId) ?? "?";
    // retornar "- <Nombre>: <cantidad de goles> (<minutos>)"
    // si todos los minutos son "?", entonces retornar "- <Nombre>: <cantidad de goles>"
    if (minutos.every((m) => m === "?")) return `- ${minutos.length.toString()} ${nombre}`;
    return `- ${minutos.length.toString()} ${nombre}: (${minutos.join(", ")})`;
  });
  return ["Goles:", ...lineas];
}

/** Cuerpo estilo finalizado: goles + tarjetas + penales. Desde la línea 3, en juego usa la misma lógica. */
function cuerpoFinalizado(detalle: PartidoDetalle, jugadores: Map<string, string>): string[] {
  const lineas = [...bloqueGolesGeneral(detalle.eventos, jugadores)];

  const amarillasPorJugador = new Map<string, number>();
  const rojasPorJugador = new Map<string, number>();
  for (const e of detalle.eventos) {
    if (e.tipo === "amarilla") amarillasPorJugador.set(e.jugadorId, (amarillasPorJugador.get(e.jugadorId) ?? 0) + 1);
    else if (e.tipo === "roja") rojasPorJugador.set(e.jugadorId, (rojasPorJugador.get(e.jugadorId) ?? 0) + 1);
  }

  const lineasTarjetas: string[] = [];
  const amarillasOrdenadas = [...amarillasPorJugador.entries()].sort(([aId], [bId]) =>
    (jugadores.get(aId) ?? "?").localeCompare(jugadores.get(bId) ?? "?"),
  );
  if (amarillasOrdenadas.length > 0) {
    lineasTarjetas.push(`TA: ${amarillasOrdenadas.map(([id, n]) => `${jugadores.get(id) ?? "?"} ${n}`).join(", ")}`);
  }
  const rojasOrdenadas = [...rojasPorJugador.entries()].sort(([aId], [bId]) =>
    (jugadores.get(aId) ?? "?").localeCompare(jugadores.get(bId) ?? "?"),
  );
  if (rojasOrdenadas.length > 0) {
    lineasTarjetas.push(`TR: ${rojasOrdenadas.map(([id, n]) => `${jugadores.get(id) ?? "?"} ${n}`).join(", ")}`);
  }
  if (lineasTarjetas.length > 0) {
    lineas.push("", ...lineasTarjetas);
  }

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
