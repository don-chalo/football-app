import { uniqueKey } from "../domain/normalize";
import { EquipoModel } from "../models/equipo.model";
import { JugadorModel } from "../models/jugador.model";
import { LigaModel } from "../models/liga.model";
import { mapAudit, type CreatedBy, type Equipo, type Jugador, type Liga, type RawCreatedBy } from "./types";

export interface CrudRepo<T, C, U> {
  findById(id: string): Promise<T | null>;
  list(): Promise<T[]>;
  create(data: C): Promise<T>;
  update(id: string, data: U): Promise<T | null>;
  remove(id: string): Promise<boolean>;
}

export type LigaInput = { nombre: string; formato: "liga" | "copa"; idaVuelta?: boolean; createdBy?: CreatedBy | null };
export type LigaPatch = Partial<LigaInput>;

function mapLiga(d: {
  _id: unknown;
  nombre: string;
  formato: "liga" | "copa";
  idaVuelta: boolean;
  createdBy?: RawCreatedBy | null;
  createdAt?: Date;
}): Liga {
  return {
    id: String(d._id),
    nombre: d.nombre,
    formato: d.formato,
    idaVuelta: d.idaVuelta,
    ...mapAudit(d),
  };
}

export class MongooseLigasRepo implements CrudRepo<Liga, LigaInput, LigaPatch> {
  async findById(id: string): Promise<Liga | null> {
    const d = await LigaModel.findById(id).lean();
    return d ? mapLiga(d) : null;
  }
  async list(): Promise<Liga[]> {
    return (await LigaModel.find().sort({ nombre: 1 }).lean()).map(mapLiga);
  }
  async create(data: LigaInput): Promise<Liga> {
    const d = await LigaModel.create({
      nombre: data.nombre.trim(),
      formato: data.formato,
      idaVuelta: data.idaVuelta ?? false,
      createdBy: data.createdBy ?? null,
    });
    return mapLiga(d.toObject());
  }
  async update(id: string, data: LigaPatch): Promise<Liga | null> {
    const patch: Record<string, unknown> = {};
    if (data.nombre !== undefined) patch["nombre"] = data.nombre.trim();
    if (data.formato !== undefined) patch["formato"] = data.formato;
    if (data.idaVuelta !== undefined) patch["idaVuelta"] = data.idaVuelta;
    const d = await LigaModel.findByIdAndUpdate(id, patch, { new: true }).lean();
    return d ? mapLiga(d) : null;
  }
  async remove(id: string): Promise<boolean> {
    return (await LigaModel.findByIdAndDelete(id).lean()) !== null;
  }
}

function mapNombrado(d: { _id: unknown; nombre: string }): { id: string; nombre: string } {
  return { id: String(d._id), nombre: d.nombre };
}

export class MongooseEquiposRepo {
  async findById(id: string): Promise<Equipo | null> {
    const d = await EquipoModel.findById(id).lean();
    return d ? mapNombrado(d) : null;
  }
  async findByNombre(nombre: string): Promise<Equipo | null> {
    const d = await EquipoModel.findOne({ nombreKey: uniqueKey(nombre) }).lean();
    return d ? mapNombrado(d) : null;
  }
  async list(): Promise<Equipo[]> {
    return (await EquipoModel.find().sort({ nombre: 1 }).lean()).map(mapNombrado);
  }
  async create(nombre: string): Promise<Equipo> {
    const d = await EquipoModel.create({ nombre: nombre.trim(), nombreKey: uniqueKey(nombre) });
    return mapNombrado(d.toObject());
  }
  async update(id: string, nombre: string): Promise<Equipo | null> {
    const d = await EquipoModel.findByIdAndUpdate(
      id,
      { nombre: nombre.trim(), nombreKey: uniqueKey(nombre) },
      { new: true },
    ).lean();
    return d ? mapNombrado(d) : null;
  }
  async remove(id: string): Promise<boolean> {
    return (await EquipoModel.findByIdAndDelete(id).lean()) !== null;
  }
}

export class MongooseJugadoresRepo {
  async findById(id: string): Promise<Jugador | null> {
    const d = await JugadorModel.findById(id).lean();
    return d ? mapNombrado(d) : null;
  }
  async findByNombre(nombre: string): Promise<Jugador | null> {
    const d = await JugadorModel.findOne({ nombreKey: uniqueKey(nombre) }).lean();
    return d ? mapNombrado(d) : null;
  }
  async list(): Promise<Jugador[]> {
    return (await JugadorModel.find().sort({ nombre: 1 }).lean()).map(mapNombrado);
  }
  async create(nombre: string): Promise<Jugador> {
    const d = await JugadorModel.create({ nombre: nombre.trim(), nombreKey: uniqueKey(nombre) });
    return mapNombrado(d.toObject());
  }
  async update(id: string, nombre: string): Promise<Jugador | null> {
    const d = await JugadorModel.findByIdAndUpdate(
      id,
      { nombre: nombre.trim(), nombreKey: uniqueKey(nombre) },
      { new: true },
    ).lean();
    return d ? mapNombrado(d) : null;
  }
  async remove(id: string): Promise<boolean> {
    return (await JugadorModel.findByIdAndDelete(id).lean()) !== null;
  }
}
