export interface CreatedBy {
  userId: string;
  username: string;
}

export type Role = "admin_partidos" | "admin_usuarios";
export type Formato = "liga" | "copa";
export type EstadoPartido = "programado" | "en_juego" | "finalizado";
export type TipoEvento = "gol" | "autogol" | "penal";

export interface PublicUser {
  id: string;
  username: string;
  role: Role;
}

export interface LoginResponse {
  token: string;
  user: PublicUser;
  misLigas: string[];
}

export interface Liga {
  id: string;
  nombre: string;
  formato: Formato;
  idaVuelta: boolean;
  createdBy: CreatedBy | null;
  createdAt: string | null;
}

export interface Equipo {
  id: string;
  nombre: string;
}

export interface Jugador {
  id: string;
  nombre: string;
}

export interface Convocatoria {
  id: string;
  partidoId: string;
  jugadorId: string;
  equipoId: string;
  estado: "convocado" | "ausente";
  createdBy: CreatedBy | null;
  createdAt: string | null;
}

export interface Evento {
  id: string;
  partidoId: string;
  jugadorId: string;
  equipoId: string;
  tipo: TipoEvento;
  minuto: number | null;
  createdBy: CreatedBy | null;
  createdAt: string | null;
}

export interface PartidoDetalle {
  id: string;
  ligaId: string;
  localId: string;
  visitaId: string;
  fecha: string;
  estado: EstadoPartido;
  fase: string;
  idaDe: string | null;
  penalesLocal: number | null;
  penalesVisita: number | null;
  clasificadoId: string | null;
  inicioEn: string | null;
  pausaDesde: string | null;
  pausaAcumSeg: number;
  finEn: string | null;
  createdBy: CreatedBy | null;
  createdAt: string | null;
  marcador: { local: number; visita: number };
  convocatorias: Convocatoria[];
  eventos: Evento[];
}

export interface FilaEquipo {
  equipoId: string;
  nombre: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dif: number;
  pts: number;
}

export interface FilaJugador {
  jugadorId: string;
  nombre: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  goles: number;
  autogoles: number;
  convocados: number;
  ausentes: number;
  inasistencia: number;
  jugados: number;
}

export interface Historial {
  equipoA: string;
  equipoB: string;
  pj: number;
  ganA: number;
  emp: number;
  ganB: number;
  gfA: number;
  gfB: number;
  partidos: Array<{ partidoId: string; golesA: number; golesB: number }>;
}

export interface Asignacion {
  id: string;
  userId: string;
  ligaId: string;
}

export interface BulkResult {
  creados: Jugador[];
  errores: Array<{ nombre: string; motivo: string }>;
}
