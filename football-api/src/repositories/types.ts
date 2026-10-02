import type { Types } from "mongoose";
import type { EstadoConvocatoria, EstadoPartido, TipoEvento } from "../domain/types";
import type { Role } from "../http/middleware/auth";

export type { EstadoConvocatoria, EstadoPartido, TipoEvento, Role };

export interface User {
  id: string;
  username: string;
  role: Role;
  passwordHash: string;
}

export interface CreatedBy {
  userId: string;
  username: string;
}

/** Actor autenticado que realiza una escritura (viene del token, nunca del cliente). */
export interface Actor {
  userId: string;
  username: string;
}

export interface Liga {
  id: string;
  nombre: string;
  formato: "liga" | "copa";
  idaVuelta: boolean;
  createdBy: CreatedBy | null;
  createdAt: Date | null;
}

export interface Equipo {
  id: string;
  nombre: string;
}

export interface Jugador {
  id: string;
  nombre: string;
}

export interface Partido {
  id: string;
  ligaId: string;
  localId: string;
  visitaId: string;
  fecha: Date;
  estado: EstadoPartido;
  fase: string;
  idaDe: string | null;
  penalesLocal: number | null;
  penalesVisita: number | null;
  clasificadoId: string | null;
  inicioEn: Date | null;
  pausaDesde: Date | null;
  pausaAcumSeg: number;
  finEn: Date | null;
  createdBy: CreatedBy | null;
  createdAt: Date | null;
}

export interface Convocatoria {
  id: string;
  partidoId: string;
  jugadorId: string;
  equipoId: string;
  estado: EstadoConvocatoria;
  createdBy: CreatedBy | null;
  createdAt: Date | null;
}

export interface Evento {
  id: string;
  partidoId: string;
  jugadorId: string;
  equipoId: string;
  tipo: TipoEvento;
  minuto: number | null;
  metadata?: unknown;
  createdBy: CreatedBy | null;
  createdAt: Date | null;
}

export interface Asignacion {
  id: string;
  userId: string;
  ligaId: string;
}

export interface RawCreatedBy {
  userId: Types.ObjectId | null;
  username: string | null;
}

/** Mapea createdBy/createdAt de un lean doc a la entidad (legacy sin actor → null). */
export function mapAudit(d: { createdBy?: RawCreatedBy | null; createdAt?: Date }): {
  createdBy: CreatedBy | null;
  createdAt: Date | null;
} {
  const cb = d.createdBy;
  return {
    createdBy: cb?.userId ? { userId: cb.userId.toHexString(), username: cb.username ?? "" } : null,
    createdAt: d.createdAt ?? null,
  };
}
