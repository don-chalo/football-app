import type { HttpClient } from "./http";
import type { BulkResult, Jugador } from "./types";

export interface JugadoresService {
  listar: () => Promise<Jugador[]>;
  crear: (nombre: string) => Promise<Jugador>;
  crearVarios: (nombres: string[]) => Promise<BulkResult>;
  borrar: (id: string) => Promise<void>;
}

export function createJugadoresService(http: HttpClient): JugadoresService {
  return {
    listar: () => http.get<Jugador[]>("/jugadores"),
    crear: (nombre) => http.post<Jugador>("/jugadores", { nombre }),
    crearVarios: (nombres) => http.post<BulkResult>("/jugadores/bulk", { nombres }),
    borrar: (id) => http.del(`/jugadores/${id}`),
  };
}
