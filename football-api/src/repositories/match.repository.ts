import { ConvocatoriaModel } from "../models/convocatoria.model";
import { EventoModel } from "../models/evento.model";
import { mapAudit, type Convocatoria, type CreatedBy, type Evento, type RawCreatedBy } from "./types";

function mapC(d: {
  _id: unknown;
  partidoId: unknown;
  jugadorId: unknown;
  equipoId: unknown;
  estado: Convocatoria["estado"];
  createdBy?: RawCreatedBy | null;
  createdAt?: Date;
}): Convocatoria {
  return {
    id: String(d._id),
    partidoId: String(d.partidoId),
    jugadorId: String(d.jugadorId),
    equipoId: String(d.equipoId),
    estado: d.estado,
    ...mapAudit(d),
  };
}

export class MongooseConvocatoriasRepo {
  async findById(id: string): Promise<Convocatoria | null> {
    const d = await ConvocatoriaModel.findById(id).lean();
    return d ? mapC(d) : null;
  }
  async listByPartido(partidoId: string): Promise<Convocatoria[]> {
    return (await ConvocatoriaModel.find({ partidoId }).lean()).map(mapC);
  }
  async listByPartidos(partidoIds: string[]): Promise<Convocatoria[]> {
    if (partidoIds.length === 0) return [];
    return (await ConvocatoriaModel.find({ partidoId: { $in: partidoIds } }).lean()).map(mapC);
  }
  async findByPartidoJugador(partidoId: string, jugadorId: string): Promise<Convocatoria | null> {
    const d = await ConvocatoriaModel.findOne({ partidoId, jugadorId }).lean();
    return d ? mapC(d) : null;
  }
  async create(data: Omit<Convocatoria, "id" | "createdAt" | "createdBy"> & { createdBy?: CreatedBy | null }): Promise<Convocatoria> {
    const d = await ConvocatoriaModel.create({ ...data, createdBy: data.createdBy ?? null });
    return mapC(d.toObject());
  }
  async update(id: string, estado: Convocatoria["estado"]): Promise<Convocatoria | null> {
    const d = await ConvocatoriaModel.findByIdAndUpdate(id, { estado }, { new: true }).lean();
    return d ? mapC(d) : null;
  }
  async remove(id: string): Promise<boolean> {
    return (await ConvocatoriaModel.findByIdAndDelete(id).lean()) !== null;
  }
}

function mapE(d: {
  _id: unknown;
  partidoId: unknown;
  jugadorId: unknown;
  equipoId: unknown;
  tipo: Evento["tipo"];
  minuto: number | null;
  metadata?: unknown;
  createdBy?: RawCreatedBy | null;
  createdAt?: Date;
}): Evento {
  return {
    id: String(d._id),
    partidoId: String(d.partidoId),
    jugadorId: String(d.jugadorId),
    equipoId: String(d.equipoId),
    tipo: d.tipo,
    minuto: d.minuto,
    metadata: d.metadata,
    ...mapAudit(d),
  };
}

export class MongooseEventosRepo {
  async findById(id: string): Promise<Evento | null> {
    const d = await EventoModel.findById(id).lean();
    return d ? mapE(d) : null;
  }
  async listByPartido(partidoId: string): Promise<Evento[]> {
    return (await EventoModel.find({ partidoId }).sort({ createdAt: 1 }).lean()).map(mapE);
  }
  async listByPartidos(partidoIds: string[]): Promise<Evento[]> {
    if (partidoIds.length === 0) return [];
    return (await EventoModel.find({ partidoId: { $in: partidoIds } }).lean()).map(mapE);
  }
  async create(data: Omit<Evento, "id" | "createdAt" | "createdBy"> & { createdBy?: CreatedBy | null }): Promise<Evento> {
    const d = await EventoModel.create({ ...data, createdBy: data.createdBy ?? null });
    return mapE(d.toObject());
  }
  async update(
    id: string,
    data: Partial<Pick<Evento, "tipo" | "minuto" | "metadata" | "jugadorId" | "equipoId">>,
  ): Promise<Evento | null> {
    const d = await EventoModel.findByIdAndUpdate(id, data, { new: true }).lean();
    return d ? mapE(d) : null;
  }
  async remove(id: string): Promise<boolean> {
    return (await EventoModel.findByIdAndDelete(id).lean()) !== null;
  }
}
