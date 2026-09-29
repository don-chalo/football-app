import { Schema, model, type Document, type Types } from "mongoose";
import { createdBySchema, type CreatedBy } from "./createdBy";
import { TIPOS_EVENTO, type TipoEvento } from "../domain/types";

export interface EventoDoc extends Document {
  partidoId: Types.ObjectId;
  jugadorId: Types.ObjectId;
  equipoId: Types.ObjectId;
  tipo: TipoEvento;
  minuto: number | null;
  metadata: unknown;
  createdBy: CreatedBy | null;
}

const eventoSchema = new Schema<EventoDoc>(
  {
    partidoId: { type: Schema.Types.ObjectId, ref: "Partido", required: true },
    jugadorId: { type: Schema.Types.ObjectId, ref: "Jugador", required: true },
    equipoId: { type: Schema.Types.ObjectId, ref: "Equipo", required: true },
    tipo: { type: String, required: true, enum: TIPOS_EVENTO },
    minuto: { type: Number, default: null, min: 0, max: 200 },
    metadata: { type: Schema.Types.Mixed, default: undefined },
    createdBy: { type: createdBySchema, default: null },
  },
  { timestamps: true },
);

eventoSchema.index({ partidoId: 1 });

export const EventoModel = model<EventoDoc>("Evento", eventoSchema);
