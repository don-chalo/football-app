import type { NextFunction, Request, Response } from "express";
import { forbidden, unauthorized } from "../errors";
import type { MongooseAsignacionesRepo } from "../../repositories/asignaciones.repository";
import type { MongoosePartidosRepo } from "../../repositories/partidos.repository";
import type { MongooseConvocatoriasRepo, MongooseEventosRepo } from "../../repositories/match.repository";
import type { Actor } from "../../repositories/types";
import type { MongooseUsersRepo } from "../../repositories/users.repository";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      actor?: Actor;
    }
  }
}

/**
 * Carga el usuario del token a `req.actor` (snapshot para auditoría).
 * Además revoca en la práctica tokens de usuarios eliminados (401).
 */
export function attachActor(users: Pick<MongooseUsersRepo, "findById">) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const sub = req.auth?.sub;
    if (!sub) {
      next(unauthorized());
      return;
    }
    users
      .findById(sub)
      .then((u) => {
        if (!u) {
          next(unauthorized("Usuario inexistente"));
          return;
        }
        req.actor = { userId: u.id, username: u.username };
        next();
      })
      .catch((err: unknown) => {
        next(err);
      });
  };
}

export interface ScopeDeps {
  asignaciones: Pick<MongooseAsignacionesRepo, "exists">;
  partidos: Pick<MongoosePartidosRepo, "findById">;
  convocatorias: Pick<MongooseConvocatoriasRepo, "findById">;
  eventos: Pick<MongooseEventosRepo, "findById">;
}

/**
 * Scoping por liga: `admin_usuarios` pasa siempre; `admin_partidos` solo
 * con asignación a la liga resuelta. Si la liga no se puede resolver de la
 * request, deja pasar (la validación posterior responde 404/422).
 */
export function requireLigaAccess(deps: ScopeDeps, resolve: (req: Request) => Promise<string | null>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    void check().catch((err: unknown) => {
      next(err);
    });
    async function check(): Promise<void> {
      if (req.auth?.role === "admin_usuarios") {
        next();
        return;
      }
      const ligaId = await resolve(req);
      if (!ligaId) {
        next();
        return;
      }
      if (!(await deps.asignaciones.exists(req.auth?.sub ?? "", ligaId))) {
        next(forbidden("Sin acceso a esta liga"));
        return;
      }
      next();
    }
  };
}

/** Resolutores de ligaId por tipo de ruta. */
export function ligaFromParams(param = "id"): (req: Request) => Promise<string | null> {
  return (req: Request): Promise<string | null> => {
    const v = req.params[param];
    return Promise.resolve(typeof v === "string" && /^[0-9a-fA-F]{24}$/.test(v) ? v : null);
  };
}

export function ligaFromBody(): (req: Request) => Promise<string | null> {
  return (req: Request): Promise<string | null> => {
    const v = (req.body as { ligaId?: unknown } | undefined)?.ligaId;
    return Promise.resolve(typeof v === "string" && /^[0-9a-fA-F]{24}$/.test(v) ? v : null);
  };
}

export function ligaFromPartidoParam(deps: ScopeDeps, param = "partidoId"): (req: Request) => Promise<string | null> {
  return async (req: Request) => {
    const id = req.params[param];
    if (typeof id !== "string" || !/^[0-9a-fA-F]{24}$/.test(id)) return null;
    const p = await deps.partidos.findById(id);
    return p ? p.ligaId : null;
  };
}

export function ligaFromConvocatoria(deps: ScopeDeps): (req: Request) => Promise<string | null> {
  return async (req: Request) => {
    const id = req.params["id"];
    if (typeof id !== "string" || !/^[0-9a-fA-F]{24}$/.test(id)) return null;
    const c = await deps.convocatorias.findById(id);
    if (!c) return null;
    const p = await deps.partidos.findById(c.partidoId);
    return p ? p.ligaId : null;
  };
}

export function ligaFromEvento(deps: ScopeDeps): (req: Request) => Promise<string | null> {
  return async (req: Request) => {
    const id = req.params["id"];
    if (typeof id !== "string" || !/^[0-9a-fA-F]{24}$/.test(id)) return null;
    const e = await deps.eventos.findById(id);
    if (!e) return null;
    const p = await deps.partidos.findById(e.partidoId);
    return p ? p.ligaId : null;
  };
}
