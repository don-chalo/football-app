import { AsignacionModel } from "../models/asignacion.model";
import type { Asignacion } from "./types";

function map(d: { _id: unknown; userId: unknown; ligaId: unknown }): Asignacion {
  return { id: String(d._id), userId: String(d.userId), ligaId: String(d.ligaId) };
}

export class MongooseAsignacionesRepo {
  async listByLiga(ligaId: string): Promise<Asignacion[]> {
    return (await AsignacionModel.find({ ligaId }).lean()).map(map);
  }
  async listByUser(userId: string): Promise<Asignacion[]> {
    return (await AsignacionModel.find({ userId }).lean()).map(map);
  }
  async countByLiga(ligaId: string): Promise<number> {
    return AsignacionModel.countDocuments({ ligaId });
  }
  async exists(userId: string, ligaId: string): Promise<boolean> {
    return (await AsignacionModel.exists({ userId, ligaId })) !== null;
  }
  async create(userId: string, ligaId: string): Promise<Asignacion> {
    const d = await AsignacionModel.create({ userId, ligaId });
    return map(d.toObject());
  }
  async remove(userId: string, ligaId: string): Promise<boolean> {
    return (await AsignacionModel.findOneAndDelete({ userId, ligaId }).lean()) !== null;
  }
  async removeByLiga(ligaId: string): Promise<number> {
    const r = await AsignacionModel.deleteMany({ ligaId });
    return r.deletedCount;
  }
}
