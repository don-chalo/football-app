import { useEffect, useState } from "react";

export interface RelojPartido {
  estado: string;
  inicioEn: string | null;
  pausaDesde: string | null;
  pausaAcumSeg: number;
  finEn: string | null;
}

/** Milisegundos de juego transcurridos a `ahora`; null si nunca inició. */
export function transcurridoMs(p: RelojPartido, ahora: number): number | null {
  if (!p.inicioEn) return null;
  const inicio = new Date(p.inicioEn).getTime();
  const fin = p.finEn ? new Date(p.finEn).getTime() : ahora;
  let ms = fin - inicio - p.pausaAcumSeg * 1000;
  if (p.pausaDesde && !p.finEn) ms -= ahora - new Date(p.pausaDesde).getTime();
  return Math.max(0, ms);
}

/** Minuto de juego 1-based; null si nunca inició. */
export function minutoDePartido(p: RelojPartido, ahora: number): number | null {
  const ms = transcurridoMs(p, ahora);
  return ms === null ? null : Math.max(1, Math.floor(ms / 60000) + 1);
}

/** Texto MM:SS del tiempo transcurrido; null si nunca inició. */
export function textoReloj(p: RelojPartido, ahora: number): string | null {
  const ms = transcurridoMs(p, ahora);
  if (ms === null) return null;
  const totalSeg = Math.floor(ms / 1000);
  const mm = String(Math.floor(totalSeg / 60)).padStart(2, "0");
  const ss = String(totalSeg % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

/**
 * Reloj en vivo derivado de los campos del servidor (resiste refresh).
 * Tick local cada segundo; el polling de la página re-ancla.
 */
export function useCronometro(p: RelojPartido | null): {
  minuto: number | null;
  texto: string | null;
  corriendo: boolean;
  pausado: boolean;
  minutoAuto: number | null;
} {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => { setAhora(Date.now()); }, 1000);
    return () => { clearInterval(t); };
  }, []);
  if (!p) return { minuto: null, texto: null, corriendo: false, pausado: false, minutoAuto: null };
  const corriendo = p.estado === "en_juego" && !p.pausaDesde && !p.finEn;
  const pausado = p.estado === "en_juego" && !!p.pausaDesde;
  const minuto = minutoDePartido(p, ahora);
  return {
    minuto,
    texto: textoReloj(p, ahora),
    corriendo,
    pausado,
    minutoAuto: corriendo ? minuto : null,
  };
}
