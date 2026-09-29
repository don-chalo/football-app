import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../../config";
import { forbidden, unauthorized } from "../errors";

export type Role = "admin_partidos" | "admin_usuarios";
export const ROLES: Role[] = ["admin_partidos", "admin_usuarios"];

export interface AuthPayload {
  sub: string;
  role: Role;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): AuthPayload {
  const decoded = jwt.verify(token, config.jwtSecret) as Partial<AuthPayload> | string;
  if (typeof decoded === "string") throw unauthorized("Token invalido");
  const { sub, role } = decoded;
  if (typeof sub !== "string" || (role !== "admin_partidos" && role !== "admin_usuarios")) {
    throw unauthorized("Token invalido");
  }
  return { sub, role };
}

/** Exige token valido. GET publicos no usan este middleware. */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(unauthorized());
    return;
  }
  try {
    req.auth = verifyToken(header.slice("Bearer ".length));
    next();
  } catch {
    next(unauthorized("Token invalido o expirado"));
  }
}

/** Exige token valido y uno de los roles indicados. Implica requireAuth. */
export function requireRole(...allowed: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    requireAuth(req, res, (authErr?: unknown) => {
      if (authErr) {
        next(authErr);
        return;
      }
      const role = req.auth?.role;
      if (!role) {
        next(unauthorized());
        return;
      }
      // admin_usuarios es superset: puede todo lo de admin_partidos
      if (role === "admin_usuarios" || allowed.includes(role)) {
        next();
        return;
      }
      next(forbidden());
    });
  };
}

export const requireAdmin = requireRole("admin_partidos", "admin_usuarios");
export const requireUserAdmin = requireRole("admin_usuarios");
