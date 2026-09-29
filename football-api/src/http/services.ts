import type { createAuthService, createUsersService } from "../services/users.service";
import type { createLigasService } from "../services/ligas.service";
import type { createEquiposService, createJugadoresService } from "../services/catalogos.service";
import type { createPartidosService } from "../services/partidos.service";
import type { createConvocatoriasService } from "../services/convocatorias.service";
import type { createEventosService } from "../services/eventos.service";
import type { createEstadisticasService } from "../services/estadisticas.service";
import type { createAsignacionesService } from "../services/asignaciones.service";

export interface Services {
  auth: ReturnType<typeof createAuthService>;
  users: ReturnType<typeof createUsersService>;
  ligas: ReturnType<typeof createLigasService>;
  equipos: ReturnType<typeof createEquiposService>;
  jugadores: ReturnType<typeof createJugadoresService>;
  partidos: ReturnType<typeof createPartidosService>;
  convocatorias: ReturnType<typeof createConvocatoriasService>;
  eventos: ReturnType<typeof createEventosService>;
  asignaciones: ReturnType<typeof createAsignacionesService>;
  estadisticas: ReturnType<typeof createEstadisticasService>;
}
