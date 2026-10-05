export type EstadoPartido = "programado" | "en_juego" | "finalizado" | "suspendido";
export const ESTADOS: EstadoPartido[] = ["programado", "en_juego", "finalizado", "suspendido"];

export type TipoEvento = "gol" | "autogol" | "penal";
export const TIPOS_EVENTO: TipoEvento[] = ["gol", "autogol", "penal"];

export type EstadoConvocatoria = "convocado" | "ausente";

export interface EventoBase {
  jugadorId: string;
  equipoId: string;
  tipo: TipoEvento;
}

export interface PartidoBase {
  id: string;
  ligaId: string;
  localId: string;
  visitaId: string;
  fecha: Date;
  estado: EstadoPartido;
  eventos: EventoBase[];
}

export interface ConvocatoriaBase {
  partidoId: string;
  jugadorId: string;
  equipoId: string;
  estado: EstadoConvocatoria;
}
