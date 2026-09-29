import { Schema, type Types } from "mongoose";

/** Snapshot del actor que creó el registro (auditoría Nivel 2). null = legacy. */
export interface CreatedBy {
  userId: Types.ObjectId | null;
  username: string | null;
}

export const createdBySchema = new Schema<CreatedBy>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    username: { type: String, default: null },
  },
  { _id: false },
);
