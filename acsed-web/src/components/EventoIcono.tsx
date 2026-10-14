import type { JSX } from "react";
import type { Evento } from "../api/types";
import { SoccerBall } from "./icons/SoccerBall";
import { TarjetaAmarillaIcon } from "./icons/TarjetaAmarillaIcon";
import { TarjetaRojaIcon } from "./icons/TarjetaRojaIcon";

const ETIQUETA: Record<Evento["tipo"], string> = {
  gol: "Gol",
  autogol: "Autogol",
  penal: "Penal",
  amarilla: "Tarjeta amarilla",
  roja: "Tarjeta roja",
};

/** Etiqueta accesible del tipo de evento ("Gol", "Tarjeta amarilla", ...). */
export function etiquetaEvento(tipo: Evento["tipo"]): string {
  return ETIQUETA[tipo];
}

/** Ícono del tipo de evento: pelota para goles, tarjeta para amarilla/roja. Tamaño vía className. */
export function IconoEvento({ tipo, className }: { tipo: Evento["tipo"]; className?: string }): JSX.Element {
  if (tipo === "amarilla") return <TarjetaAmarillaIcon className={className} />;
  if (tipo === "roja") return <TarjetaRojaIcon className={className} />;
  return <SoccerBall className={className} />;
}
