import { Schema, model, type Document, type Types } from "mongoose";
import { createdBySchema, type CreatedBy } from "./createdBy";
import { ESTADOS, type EstadoPartido } from "../domain/types";

export interface PartidoDoc extends Document {
  ligaId: Types.ObjectId;
  localId: Types.ObjectId;
  visitaId: Types.ObjectId;
  fecha: Date;
  estado: EstadoPartido;
  fase: string;
  idaDe: Types.ObjectId | null;
  penalesLocal: number | null;
  penalesVisita: number | null;
  clasificadoId: Types.ObjectId | null;
  createdBy: CreatedBy | null;
}

const partidoSchema = new Schema<PartidoDoc>(
  {
    ligaId: { type: Schema.Types.ObjectId, ref: "Liga", required: true, index: true },
    localId: { type: Schema.Types.ObjectId, ref: "Equipo", required: true },
    visitaId: { type: Schema.Types.ObjectId, ref: "Equipo", required: true },
    fecha: { type: Date, required: true, index: true },
    estado: { type: String, required: true, enum: ESTADOS, default: "programado", index: true },
    fase: { type: String, default: "" },
    idaDe: { type: Schema.Types.ObjectId, ref: "Partido", default: null },
    penalesLocal: { type: Number, default: null, min: 0 },
    penalesVisita: { type: Number, default: null, min: 0 },
    clasificadoId: { type: Schema.Types.ObjectId, ref: "Equipo", default: null },
    createdBy: { type: createdBySchema, default: null },
  },
  { timestamps: true },
);

partidoSchema.index({ estado: 1, fecha: 1, ligaId: 1 });

export const PartidoModel = model<PartidoDoc>("Partido", partidoSchema);
