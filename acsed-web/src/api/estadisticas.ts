import { conQuery, type HttpClient } from "./http";
import type { FilaEquipo, FilaJugador, Historial } from "./types";

export interface RangoFechas {
  desde: string;
  hasta: string;
}

export interface EstadisticasService {
  porEquipos: (rango: RangoFechas) => Promise<FilaEquipo[]>;
  porJugadores: (rango: RangoFechas) => Promise<FilaJugador[]>;
  porLigaEquipos: (ligaId: string) => Promise<FilaEquipo[]>;
  porLigaJugadores: (ligaId: string) => Promise<FilaJugador[]>;
  enfrentamiento: (equipoA: string, equipoB: string) => Promise<Historial>;
}

export function createEstadisticasService(http: HttpClient): EstadisticasService {
  return {
    porEquipos: (rango) => http.get<FilaEquipo[]>(conQuery("/estadisticas/equipos", rango)),
    porJugadores: (rango) => http.get<FilaJugador[]>(conQuery("/estadisticas/jugadores", rango)),
    porLigaEquipos: (ligaId) => http.get<FilaEquipo[]>(conQuery("/estadisticas/equipos", { liga_ids: ligaId })),
    porLigaJugadores: (ligaId) => http.get<FilaJugador[]>(conQuery("/estadisticas/jugadores", { liga_ids: ligaId })),
    enfrentamiento: (equipoA, equipoB) =>
      http.get<Historial>(conQuery("/estadisticas/enfrentamientos", { equipo_a: equipoA, equipo_b: equipoB })),
  };
}
