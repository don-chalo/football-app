import { createAsignacionesService } from "./asignaciones";
import { createAuthService } from "./auth";
import { api } from "./client";
import { createConvocatoriasService } from "./convocatorias";
import { createEquiposService } from "./equipos";
import { createEstadisticasService } from "./estadisticas";
import { createEventosService } from "./eventos";
import type { HttpClient } from "./http";
import { createJugadoresService } from "./jugadores";
import { createLigasService } from "./ligas";
import { createPartidosService } from "./partidos";
import { createUsuariosService } from "./usuarios";

/** Composition root: construye todos los servicios con un transporte. */
export function createServices(http: HttpClient) {
  return {
    auth: createAuthService(http),
    ligas: createLigasService(http),
    equipos: createEquiposService(http),
    jugadores: createJugadoresService(http),
    usuarios: createUsuariosService(http),
    asignaciones: createAsignacionesService(http),
    partidos: createPartidosService(http),
    convocatorias: createConvocatoriasService(http),
    eventos: createEventosService(http),
    estadisticas: createEstadisticasService(http),
  };
}

export type Services = ReturnType<typeof createServices>;

/** Servicios de la app, con el transporte real. */
export const services: Services = createServices(api);
