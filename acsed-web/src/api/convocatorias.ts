import type { HttpClient } from "./http";
import type { Convocatoria } from "./types";

export interface NuevaConvocatoria {
  jugadorId: string;
  equipoId: string;
}

export interface ConvocatoriasService {
  agregar: (partidoId: string, input: NuevaConvocatoria) => Promise<Convocatoria>;
  marcar: (id: string, estado: Convocatoria["estado"]) => Promise<Convocatoria>;
  quitar: (id: string) => Promise<void>;
}

export function createConvocatoriasService(http: HttpClient): ConvocatoriasService {
  return {
    agregar: (partidoId, input) => http.post<Convocatoria>(`/partidos/${partidoId}/convocatorias`, input),
    marcar: (id, estado) => http.patch<Convocatoria>(`/convocatorias/${id}`, { estado }),
    quitar: (id) => http.del(`/convocatorias/${id}`),
  };
}
