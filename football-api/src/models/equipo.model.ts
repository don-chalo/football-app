import { Schema, model, type Document } from "mongoose";

export interface EquipoDoc extends Document {
  nombre: string;
  nombreKey: string;
}

const equipoSchema = new Schema<EquipoDoc>(
  { nombre: { type: String, required: true, trim: true }, nombreKey: { type: String, required: true, unique: true, index: true } },
  { timestamps: true },
);

export const EquipoModel = model<EquipoDoc>("Equipo", equipoSchema);
