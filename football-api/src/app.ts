import bcrypt from "bcryptjs";
import cors from "cors";
import express from "express";
import { config } from "./config";
import { MongooseAsignacionesRepo } from "./repositories/asignaciones.repository";
import { MongooseConvocatoriasRepo, MongooseEventosRepo } from "./repositories/match.repository";
import { MongooseEquiposRepo, MongooseJugadoresRepo, MongooseLigasRepo } from "./repositories/catalogos.repository";
import { MongoosePartidosRepo } from "./repositories/partidos.repository";
import { MongooseUsersRepo } from "./repositories/users.repository";
import { createAsignacionesService } from "./services/asignaciones.service";
import { createEstadisticasService } from "./services/estadisticas.service";
import { createLigasService } from "./services/ligas.service";
import { createEquiposService, createJugadoresService } from "./services/catalogos.service";
import { createPartidosService } from "./services/partidos.service";
import { createConvocatoriasService } from "./services/convocatorias.service";
import { createEventosService } from "./services/eventos.service";
import { createAuthService, createUsersService } from "./services/users.service";
import { errorHandler } from "./http/middleware/errors";
import { buildRouter } from "./http/routes";
import type { Services } from "./http/services";

export interface AppRepos {
  users: MongooseUsersRepo;
  ligas: MongooseLigasRepo;
  equipos: MongooseEquiposRepo;
  jugadores: MongooseJugadoresRepo;
  partidos: MongoosePartidosRepo;
  convocatorias: MongooseConvocatoriasRepo;
  eventos: MongooseEventosRepo;
  asignaciones: MongooseAsignacionesRepo;
}

export function defaultRepos(): AppRepos {
  return {
    users: new MongooseUsersRepo(),
    ligas: new MongooseLigasRepo(),
    equipos: new MongooseEquiposRepo(),
    jugadores: new MongooseJugadoresRepo(),
    partidos: new MongoosePartidosRepo(),
    convocatorias: new MongooseConvocatoriasRepo(),
    eventos: new MongooseEventosRepo(),
    asignaciones: new MongooseAsignacionesRepo(),
  };
}

const hasher = {
  hash: (p: string) => bcrypt.hash(p, 10),
  compare: (p: string, h: string) => bcrypt.compare(p, h),
};

export function buildServices(repos: AppRepos): Services {
  const partidos = createPartidosService({
    partidos: repos.partidos,
    ligas: repos.ligas,
    equipos: repos.equipos,
    convocatorias: repos.convocatorias,
    eventos: repos.eventos,
  });
  return {
    auth: createAuthService(repos.users, hasher, { asignaciones: repos.asignaciones, ligas: repos.ligas }),
    users: createUsersService(repos.users, hasher),
    ligas: createLigasService({ ligas: repos.ligas, asignaciones: repos.asignaciones }),
    equipos: createEquiposService(repos.equipos),
    jugadores: createJugadoresService(repos.jugadores),
    partidos,
    convocatorias: createConvocatoriasService({
      convocatorias: repos.convocatorias,
      partidos: repos.partidos,
      jugadores: repos.jugadores,
      equipos: repos.equipos,
    }),
    eventos: createEventosService({
      eventos: repos.eventos,
      convocatorias: repos.convocatorias,
      partidos: repos.partidos,
    }),
    asignaciones: createAsignacionesService({
      asignaciones: repos.asignaciones,
      users: repos.users,
      ligas: repos.ligas,
    }),
    estadisticas: createEstadisticasService({
      partidos: repos.partidos,
      convocatorias: repos.convocatorias,
      eventos: repos.eventos,
      equipos: repos.equipos,
      jugadores: repos.jugadores,
    }),
  };
}

export function createApp(repos?: Partial<AppRepos>): express.Express {
  const full: AppRepos = { ...defaultRepos(), ...repos };
  const app = express();
  app.use(cors({ origin: config.corsOrigins }));
  app.use(express.json());
  app.use(buildRouter(buildServices(full), full));
  app.use(errorHandler);
  return app;
}
