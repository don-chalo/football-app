import { Schema, model, type Document } from "mongoose";

export interface JugadorDoc extends Document {
  nombre: string;
  nombreKey: string;
}

const jugadorSchema = new Schema<JugadorDoc>(
  { nombre: { type: String, required: true, trim: true }, nombreKey: { type: String, required: true, unique: true, index: true } },
  { timestamps: true },
);

export const JugadorModel = model<JugadorDoc>("Jugador", jugadorSchema);
