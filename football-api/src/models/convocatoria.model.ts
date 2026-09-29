import { Schema, model, type Document, type Types } from "mongoose";
import { createdBySchema, type CreatedBy } from "./createdBy";
import type { EstadoConvocatoria } from "../domain/types";

export interface ConvocatoriaDoc extends Document {
  partidoId: Types.ObjectId;
  jugadorId: Types.ObjectId;
  equipoId: Types.ObjectId;
  estado: EstadoConvocatoria;
  createdBy: CreatedBy | null;
}

const convocatoriaSchema = new Schema<ConvocatoriaDoc>(
  {
    partidoId: { type: Schema.Types.ObjectId, ref: "Partido", required: true },
    jugadorId: { type: Schema.Types.ObjectId, ref: "Jugador", required: true },
    equipoId: { type: Schema.Types.ObjectId, ref: "Equipo", required: true },
    estado: { type: String, required: true, enum: ["convocado", "ausente"], default: "convocado" },
    createdBy: { type: createdBySchema, default: null },
  },
  { timestamps: true },
);

convocatoriaSchema.index({ partidoId: 1, jugadorId: 1 }, { unique: true });

export const ConvocatoriaModel = model<ConvocatoriaDoc>("Convocatoria", convocatoriaSchema);
