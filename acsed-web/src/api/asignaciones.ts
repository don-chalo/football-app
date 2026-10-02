import type { HttpClient } from "./http";
import type { Asignacion } from "./types";

export interface AsignacionesService {
  porLiga: (ligaId: string) => Promise<Asignacion[]>;
  asignar: (ligaId: string, userId: string) => Promise<Asignacion>;
  quitar: (ligaId: string, userId: string) => Promise<void>;
}

export function createAsignacionesService(http: HttpClient): AsignacionesService {
  return {
    porLiga: (ligaId) => http.get<Asignacion[]>(`/ligas/${ligaId}/admins`),
    asignar: (ligaId, userId) => http.post<Asignacion>(`/ligas/${ligaId}/admins`, { userId }),
    quitar: (ligaId, userId) => http.del(`/ligas/${ligaId}/admins/${userId}`),
  };
}
