import { Schema, model, type Document } from "mongoose";
import { createdBySchema, type CreatedBy } from "./createdBy";

export type FormatoLiga = "liga" | "copa";

export interface LigaDoc extends Document {
  nombre: string;
  formato: FormatoLiga;
  idaVuelta: boolean;
  createdBy: CreatedBy | null;
}

const ligaSchema = new Schema<LigaDoc>(
  {
    nombre: { type: String, required: true, trim: true },
    formato: { type: String, required: true, enum: ["liga", "copa"] },
    idaVuelta: { type: Boolean, default: false },
    createdBy: { type: createdBySchema, default: null },
  },
  { timestamps: true },
);

export const LigaModel = model<LigaDoc>("Liga", ligaSchema);
