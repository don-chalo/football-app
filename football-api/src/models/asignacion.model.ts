import { Schema, model, type Document, type Types } from "mongoose";

export interface AsignacionDoc extends Document {
  userId: Types.ObjectId;
  ligaId: Types.ObjectId;
}

const asignacionSchema = new Schema<AsignacionDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ligaId: { type: Schema.Types.ObjectId, ref: "Liga", required: true },
  },
  { timestamps: true },
);

asignacionSchema.index({ userId: 1, ligaId: 1 }, { unique: true });
asignacionSchema.index({ ligaId: 1 });

export const AsignacionModel = model<AsignacionDoc>("Asignacion", asignacionSchema);
