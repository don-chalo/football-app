import { PartidoModel } from "../models/partido.model";
import type { Types } from "mongoose";
import { mapAudit, type CreatedBy, type Partido, type RawCreatedBy } from "./types";

function map(d: {
  _id: Types.ObjectId;
  ligaId: Types.ObjectId;
  localId: Types.ObjectId;
  visitaId: Types.ObjectId;
  fecha: Date;
  estado: Partido["estado"];
  fase: string;
  idaDe: Types.ObjectId | null;
  penalesLocal: number | null;
  penalesVisita: number | null;
  clasificadoId: Types.ObjectId | null;
  inicioEn: Date | null;
  pausaDesde: Date | null;
  pausaAcumSeg?: number;
  finEn: Date | null;
  createdBy?: RawCreatedBy | null;
  createdAt?: Date;
}): Partido {
  return {
    id: d._id.toHexString(),
    ligaId: d.ligaId.toHexString(),
    localId: d.localId.toHexString(),
    visitaId: d.visitaId.toHexString(),
    fecha: d.fecha,
    estado: d.estado,
    fase: d.fase,
    idaDe: d.idaDe ? d.idaDe.toHexString() : null,
    penalesLocal: d.penalesLocal,
    penalesVisita: d.penalesVisita,
    clasificadoId: d.clasificadoId ? d.clasificadoId.toHexString() : null,
    inicioEn: d.inicioEn ?? null,
    pausaDesde: d.pausaDesde ?? null,
    pausaAcumSeg: d.pausaAcumSeg ?? 0,
    finEn: d.finEn ?? null,
    ...mapAudit(d),
  };
}

export interface PartidoInput {
  ligaId: string;
  localId: string;
  visitaId: string;
  fecha: Date;
  fase?: string;
  idaDe?: string | null;
  createdBy?: CreatedBy | null;
}

export type PartidoPatch = Partial<{
  fecha: Date;
  fase: string;
  idaDe: string | null;
  penalesLocal: number | null;
  penalesVisita: number | null;
  clasificadoId: string | null;
  inicioEn: Date | null;
  pausaDesde: Date | null;
  pausaAcumSeg: number;
  finEn: Date | null;
}>;

export class MongoosePartidosRepo {
  async findById(id: string): Promise<Partido | null> {
    const d = await PartidoModel.findById(id).lean();
    return d ? map(d) : null;
  }
  async list(filtro?: { ligaId?: string; estado?: Partido["estado"] }): Promise<Partido[]> {
    const q: Record<string, unknown> = {};
    if (filtro?.ligaId) q["ligaId"] = filtro.ligaId;
    if (filtro?.estado) q["estado"] = filtro.estado;
    return (await PartidoModel.find(q).sort({ fecha: 1 }).lean()).map(map);
  }
  async listByIds(ids: string[]): Promise<Partido[]> {
    if (ids.length === 0) return [];
    return (await PartidoModel.find({ _id: { $in: ids } }).lean()).map(map);
  }
  async create(data: PartidoInput): Promise<Partido> {
    const d = await PartidoModel.create({
      ligaId: data.ligaId,
      localId: data.localId,
      visitaId: data.visitaId,
      fecha: data.fecha,
      fase: data.fase ?? "",
      idaDe: data.idaDe ?? null,
      createdBy: data.createdBy ?? null,
    });
    return map(d.toObject());
  }
  async update(id: string, data: PartidoPatch & { estado?: Partido["estado"] }): Promise<Partido | null> {
    const d = await PartidoModel.findByIdAndUpdate(id, data, { new: true }).lean();
    return d ? map(d) : null;
  }
  async remove(id: string): Promise<boolean> {
    return (await PartidoModel.findByIdAndDelete(id).lean()) !== null;
  }
}
