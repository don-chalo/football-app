import { useEffect, useState, type JSX } from "react";
import { services } from "../api/services";
import type { PartidoDetalle } from "../api/types";
import { enlaceWhatsApp, textoCompartir } from "../utils/compartir";
import { minutoDePartido } from "../hooks/useCronometro";
import { WhatsappIcon } from "./icons/WhatsappIcon";

/** Botón "Compartir por WhatsApp" para programado/en juego/finalizado. Estado interno: no re-renderiza al padre. */
export function BotonCompartir({ detalle, mapaEquipos, mapaJugadores }: {
  detalle: PartidoDetalle;
  mapaEquipos: Map<string, string>;
  mapaJugadores: Map<string, string>;
}): JSX.Element | null {
  const [ligaNombre, setLigaNombre] = useState("…");
  useEffect(() => {
    let vivo = true;
    services.ligas.obtener(detalle.ligaId).then(
      (l) => { if (vivo) setLigaNombre(l.nombre); },
      () => { if (vivo) setLigaNombre("?"); },
    );
    return () => { vivo = false; };
  }, [detalle.ligaId]);

  if (detalle.estado !== "programado" && detalle.estado !== "en_juego" && detalle.estado !== "finalizado") return null;
  const texto = textoCompartir(
    detalle,
    { equipos: mapaEquipos, jugadores: mapaJugadores, liga: ligaNombre },
    window.location.origin,
    detalle.estado === "en_juego" ? minutoDePartido(detalle, Date.now()) : null,
  );
  if (texto === null) return null;
  return (
    <a
      href={enlaceWhatsApp(texto)}
      target="_blank"
      rel="noreferrer"
      aria-label="Compartir por WhatsApp"
      title="Compartir por WhatsApp"
      className="min-h-10 min-w-10 shrink-0 flex items-center justify-center rounded-b-full rounded-t-full bg-cancha-600 px-0 text-white"
    >
      <WhatsappIcon className="h-5 w-5" />
    </a>
  );
}
