import { conQuery, type HttpClient } from "./http";
import type { EstadoPartido, PartidoDetalle } from "./types";

/** Partido sin detalle: forma que devuelve GET /partidos. */
export type PartidoBase = Omit<PartidoDetalle, "convocatorias" | "eventos" | "marcador">;
/** Elemento de GET /partidos: base + marcador calculado. */
export type PartidoListado = PartidoBase & { marcador: { local: number; visita: number } };

export interface NuevoPartido {
  ligaId: string;
  localId: string;
  visitaId: string;
  fecha: string;
  fase: string;
}

export interface PenalesDefinicion {
  penalesLocal: number | null;
  penalesVisita: number | null;
  clasificadoId: string | null;
}

export interface PartidosService {
  porLiga: (ligaId: string) => Promise<PartidoListado[]>;
  detalle: (id: string) => Promise<PartidoDetalle>;
  crear: (input: NuevoPartido) => Promise<PartidoDetalle>;
  cambiarEstado: (id: string, estado: EstadoPartido) => Promise<PartidoBase>;
  actualizarPenales: (id: string, input: PenalesDefinicion) => Promise<PartidoBase>;
}

export function createPartidosService(http: HttpClient): PartidosService {
  return {
    porLiga: (ligaId) => http.get<PartidoListado[]>(conQuery("/partidos", { ligaId })),
    detalle: (id) => http.get<PartidoDetalle>(`/partidos/${id}`),
    crear: (input) => http.post<PartidoDetalle>("/partidos", input),
    cambiarEstado: (id, estado) => http.patch<PartidoBase>(`/partidos/${id}/estado`, { estado }),
    actualizarPenales: (id, input) => http.patch<PartidoBase>(`/partidos/${id}`, input),
  };
}
