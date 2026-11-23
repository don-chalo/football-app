import type { HttpClient } from "./http";
import type { Equipo } from "./types";

export interface EquiposService {
  listar: () => Promise<Equipo[]>;
  buscar: (ids: string[]) => Promise<Equipo[]>;
  crear: (nombre: string) => Promise<Equipo>;
  borrar: (id: string) => Promise<void>;
}

export function createEquiposService(http: HttpClient): EquiposService {
  return {
    listar: () => http.get<Equipo[]>("/equipos"),
    buscar: (ids) => http.post<Equipo[]>("/equipos/buscar", { ids }),
    crear: (nombre) => http.post<Equipo>("/equipos", { nombre }),
    borrar: (id) => http.del(`/equipos/${id}`),
  };
}
