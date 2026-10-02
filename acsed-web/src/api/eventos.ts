import type { HttpClient } from "./http";
import type { Evento, TipoEvento } from "./types";

export interface NuevoEvento {
  jugadorId: string;
  equipoId: string;
  tipo: TipoEvento;
  minuto: number | null;
}

export interface EventosService {
  registrar: (partidoId: string, input: NuevoEvento) => Promise<Evento>;
  eliminar: (id: string) => Promise<void>;
}

export function createEventosService(http: HttpClient): EventosService {
  return {
    registrar: (partidoId, input) => http.post<Evento>(`/partidos/${partidoId}/eventos`, input),
    eliminar: (id) => http.del(`/eventos/${id}`),
  };
}
