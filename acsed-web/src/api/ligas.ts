import type { HttpClient } from "./http";
import type { Formato, Liga } from "./types";

export interface NuevaLiga {
  nombre: string;
  formato: Formato;
  idaVuelta: boolean;
}

export interface LigasService {
  listar: () => Promise<Liga[]>;
  obtener: (id: string) => Promise<Liga>;
  crear: (input: NuevaLiga) => Promise<Liga>;
  borrar: (id: string) => Promise<void>;
}

export function createLigasService(http: HttpClient): LigasService {
  return {
    listar: () => http.get<Liga[]>("/ligas"),
    obtener: (id) => http.get<Liga>(`/ligas/${id}`),
    crear: (input) => http.post<Liga>("/ligas", input),
    borrar: (id) => http.del(`/ligas/${id}`),
  };
}
