import type { HttpClient } from "./http";
import type { Convocatoria } from "./types";

export interface NuevaConvocatoria {
  jugadorId: string;
  equipoId: string;
}

export interface ResultadoLoteConvocatoria {
  creados: Convocatoria[];
  omitidos: string[];
}

export interface ConvocatoriasService {
  agregar: (partidoId: string, input: NuevaConvocatoria) => Promise<Convocatoria>;
  agregarLote: (partidoId: string, equipoId: string, jugadorIds: string[]) => Promise<ResultadoLoteConvocatoria>;
  marcar: (id: string, estado: Convocatoria["estado"]) => Promise<Convocatoria>;
  quitar: (id: string) => Promise<void>;
}

export function createConvocatoriasService(http: HttpClient): ConvocatoriasService {
  return {
    agregar: (partidoId, input) => http.post<Convocatoria>(`/partidos/${partidoId}/convocatorias`, input),
    agregarLote: (partidoId, equipoId, jugadorIds) =>
      http.post<ResultadoLoteConvocatoria>(`/partidos/${partidoId}/convocatorias`, { equipoId, jugadorIds }),
    marcar: (id, estado) => http.patch<Convocatoria>(`/convocatorias/${id}`, { estado }),
    quitar: (id) => http.del(`/convocatorias/${id}`),
  };
}
