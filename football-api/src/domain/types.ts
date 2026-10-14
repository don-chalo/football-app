export type EstadoPartido = "programado" | "en_juego" | "finalizado" | "suspendido";
export const ESTADOS: EstadoPartido[] = ["programado", "en_juego", "finalizado", "suspendido"];

export const TIPOS_EVENTO = ["gol", "autogol", "penal", "amarilla", "roja"] as const;
export type TipoEvento = (typeof TIPOS_EVENTO)[number];

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
