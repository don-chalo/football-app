import { useState, type JSX } from "react";
import { Collapsible, Content, Trigger } from "@radix-ui/react-collapsible";
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import type { EstadoPartido, Evento } from "../api/types";
import { formatoHora } from "../utils/fecha";
import { IconoEvento, etiquetaEvento } from "./EventoIcono";
import { Empty } from "./ui";

interface Props {
  eventos: Evento[];
  nombreJugador: (id: string) => string;
  nombreEquipo: (id: string) => string;
  inicioEn: string | null;
  finEn: string | null;
  estadoPartido: EstadoPartido;
  minutoFin: number | null;
  colapsable?: boolean;
  abiertaInicial?: boolean;
}

/**
 * Cronologia unica de eventos de un partido: hitos de inicio/fin y
 * fila por evento (jugador, icono, minuto, equipo), orden inverso.
 * En gestion se muestra colapsable con contador; en publico, expandida.
 */
export function Cronologia({ eventos, nombreJugador, nombreEquipo, inicioEn, finEn, estadoPartido, minutoFin, colapsable = false, abiertaInicial = true }: Props): JSX.Element {
  const [abierta, setAbierta] = useState(abiertaInicial);
  const muestraFin = finEn !== null || estadoPartido === "finalizado";
  const muestraInicio = inicioEn !== null || estadoPartido === "en_juego" || estadoPartido === "finalizado";

  const contenido = eventos.length === 0 && inicioEn === null && !muestraFin ? (
    <Empty texto="Sin goles." />
  ) : (
    <ul className="flex flex-col gap-1">
      {muestraFin ? (
        <li className="flex items-center bg-cancha-50 border border-cancha-600/20 rounded-lg px-3 min-h-11">
          <span className="text-sm font-medium text-cancha-800">
            {finEn ? `Fin ${formatoHora(finEn)}${minutoFin !== null ? ` · ${String(minutoFin)}'` : ""}` : "Fin"}
          </span>
        </li>
      ) : null}
      {[...eventos].reverse().map((e) => (
        <li key={e.id} className="flex items-center justify-between gap-2 bg-white border border-stone-200 rounded-lg px-3 min-h-11" aria-label={`${etiquetaEvento(e.tipo)} de ${nombreJugador(e.jugadorId)}`}>
          <span className="text-sm font-medium flex items-center gap-2">
            {nombreJugador(e.jugadorId)}
            <IconoEvento tipo={e.tipo} className="h-5 w-5" />
            {e.minuto !== null ? `${String(e.minuto)}'` : ""}
          </span>
          <span className="text-sm text-stone-500">({nombreEquipo(e.equipoId)})</span>
        </li>
      ))}
      {muestraInicio ? (
        <li className="flex items-center bg-cancha-50 border border-cancha-600/20 rounded-lg px-3 min-h-11">
          <span className="text-sm font-medium text-cancha-800">
            Inicio {inicioEn ? formatoHora(inicioEn) : null}
          </span>
        </li>
      ) : null}
    </ul>
  );

  if (!colapsable) {
    return (
      <>
        <h2 className="font-bold mb-2">Cronología</h2>
        {contenido}
      </>
    );
  }
  return (
    <Collapsible open={abierta} onOpenChange={setAbierta}>
      <Trigger asChild>
        <button
          type="button"
          className="flex min-h-11 w-full items-center justify-between font-bold"
        >
          <span>{`Cronología (${String(eventos.length)})`}</span>
          {abierta ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
        </button>
      </Trigger>
      <Content>{contenido}</Content>
    </Collapsible>
  );
}
